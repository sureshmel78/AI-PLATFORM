/* ===============================================================
Enterprise Maritime AI Intelligence Platform
AISStream Live Ingestion Service
Version : 1.0.0
=============================================================== */

class AISStreamService {
  constructor() {
    this.name = "AISStreamService";
    this.version = "1.0.0";
    this.url = process.env.AISSTREAM_URL || "wss://stream.aisstream.io/v0/stream";
    this.apiKey = process.env.AISSTREAM_API_KEY || "";
    this.boundingBoxes = this.parseBoundingBoxes(process.env.AISSTREAM_BOUNDING_BOXES);
    this.maxVessels = this.toPositiveNumber(process.env.AISSTREAM_MAX_VESSELS, 5000);
    this.staleMs = this.toPositiveNumber(process.env.AISSTREAM_STALE_MS, 900000);
    this.reconnectMs = this.toPositiveNumber(process.env.AISSTREAM_RECONNECT_MS, 15000);
    this.vessels = new Map();
    this.socket = null;
    this.started = false;
    this.connected = false;
    this.subscribed = false;
    this.lastMessageAt = null;
    this.lastError = null;
    this.reconnectTimer = null;
    this.WebSocketImpl = null;
  }

  start(WebSocketImpl = globalThis.WebSocket) {
    if (this.started) return this.getStatus();
    this.started = true;
    this.WebSocketImpl = WebSocketImpl;

    if (!this.apiKey) {
      this.lastError = "AISSTREAM_API_KEY_NOT_CONFIGURED";
      console.log("AISStream Service: API key not configured; fallback AIS remains active");
      return this.getStatus();
    }

    if (!this.WebSocketImpl) {
      this.lastError = "WEBSOCKET_IMPLEMENTATION_UNAVAILABLE";
      console.log("AISStream Service: WebSocket unavailable; fallback AIS remains active");
      return this.getStatus();
    }

    this.connect();
    return this.getStatus();
  }

  connect() {
    if (!this.started || !this.apiKey || !this.WebSocketImpl) return;

    try {
      this.clearReconnect();
      const socket = new this.WebSocketImpl(this.url);
      this.socket = socket;

      socket.addEventListener("open", () => {
        if (socket !== this.socket) return;
        this.connected = true;
        this.lastError = null;
        socket.send(JSON.stringify({
          APIKey: this.apiKey,
          BoundingBoxes: this.boundingBoxes,
          FilterMessageTypes: [
            "PositionReport",
            "StandardClassBPositionReport",
            "ExtendedClassBPositionReport",
            "ShipStaticData"
          ]
        }));
        this.subscribed = true;
        console.log("AISStream Service Connected and Subscribed");
      });

      socket.addEventListener("message", event => {
        if (socket !== this.socket) return;
        this.handleMessage(event.data);
      });

      socket.addEventListener("error", event => {
        if (socket !== this.socket) return;
        this.lastError = event?.message || "AISSTREAM_SOCKET_ERROR";
        console.error("AISStream Service Error:", this.lastError);
      });

      socket.addEventListener("close", () => {
        if (socket !== this.socket) return;
        this.connected = false;
        this.subscribed = false;
        this.socket = null;
        if (this.started) this.scheduleReconnect();
      });
    } catch (error) {
      this.lastError = error.message;
      this.connected = false;
      this.subscribed = false;
      this.scheduleReconnect();
    }
  }

  handleMessage(raw) {
    try {
      const text = typeof raw === "string" ? raw : Buffer.from(raw).toString("utf8");
      const message = JSON.parse(text);
      const vessel = this.normalizeMessage(message);
      if (!vessel || !vessel.mmsi) return;

      const existing = this.vessels.get(String(vessel.mmsi)) || {};
      this.vessels.set(String(vessel.mmsi), {
        ...existing,
        ...vessel,
        name: vessel.name !== "UNKNOWN VESSEL" ? vessel.name : existing.name || vessel.name,
        destination: vessel.destination !== "-" ? vessel.destination : existing.destination || vessel.destination,
        vesselType: vessel.vesselType !== "UNKNOWN" ? vessel.vesselType : existing.vesselType || vessel.vesselType,
        timestamp: new Date().toISOString()
      });

      this.lastMessageAt = new Date();
      this.lastError = null;
      this.prune();
    } catch (error) {
      this.lastError = `AISSTREAM_MESSAGE_ERROR: ${error.message}`;
    }
  }

  normalizeMessage(message = {}) {
    const meta = message.MetaData || {};
    const body = message.Message || {};
    const type = message.MessageType || Object.keys(body)[0] || "";
    const data = body[type] || body.PositionReport || body.StandardClassBPositionReport ||
      body.ExtendedClassBPositionReport || body.ShipStaticData || {};
    const mmsi = meta.MMSI ?? data.UserID ?? data.MMSI;
    const latitude = this.toNumber(meta.latitude ?? meta.Latitude ?? data.Latitude);
    const longitude = this.toNumber(meta.longitude ?? meta.Longitude ?? data.Longitude);

    if (!mmsi) return null;

    const existing = this.vessels.get(String(mmsi)) || {};
    const hasPosition = this.validPosition(latitude, longitude);
    if (!hasPosition && !this.validPosition(existing.latitude, existing.longitude)) return null;

    return {
      name: String(meta.ShipName || data.Name || existing.name || "UNKNOWN VESSEL").trim(),
      imo: data.ImoNumber || data.IMO || existing.imo || null,
      mmsi: String(mmsi),
      latitude: hasPosition ? latitude : existing.latitude,
      longitude: hasPosition ? longitude : existing.longitude,
      destination: String(data.Destination || existing.destination || "-").trim(),
      speed: this.toNumber(data.Sog ?? data.SpeedOverGround ?? existing.speed) ?? 0,
      course: this.toNumber(data.Cog ?? data.CourseOverGround ?? existing.course),
      heading: this.toNumber(data.TrueHeading ?? data.Heading ?? existing.heading),
      navigationStatus: String(data.NavigationalStatus ?? existing.navigationStatus ?? "UNKNOWN"),
      vesselType: String(data.Type ?? data.ShipType ?? existing.vesselType ?? "UNKNOWN"),
      provider: "AISSTREAM",
      sourceType: "LIVE_STREAM",
      isLive: true,
      timestamp: new Date().toISOString()
    };
  }

  getLiveVessels() {
    this.prune();
    return Array.from(this.vessels.values()).map(vessel => ({ ...vessel }));
  }

  hasLiveVessels() {
    return this.getLiveVessels().length > 0;
  }

  prune() {
    const cutoff = Date.now() - this.staleMs;
    for (const [mmsi, vessel] of this.vessels.entries()) {
      const timestamp = new Date(vessel.timestamp).getTime();
      if (!Number.isFinite(timestamp) || timestamp < cutoff) this.vessels.delete(mmsi);
    }

    if (this.vessels.size > this.maxVessels) {
      const ordered = Array.from(this.vessels.entries())
        .sort((a, b) => new Date(a[1].timestamp) - new Date(b[1].timestamp));
      ordered.slice(0, this.vessels.size - this.maxVessels)
        .forEach(([mmsi]) => this.vessels.delete(mmsi));
    }
  }

  getStatus() {
    const vesselCount = this.getLiveVessels().length;
    return {
      name: this.name,
      version: this.version,
      configured: Boolean(this.apiKey),
      started: this.started,
      connected: this.connected,
      subscribed: this.subscribed,
      vesselCount,
      lastMessageAt: this.lastMessageAt,
      lastError: this.lastError,
      provider: "AISSTREAM",
      status: vesselCount > 0 ? "LIVE" : this.connected ? "CONNECTED_WAITING_FOR_DATA" : "FALLBACK_ACTIVE"
    };
  }

  stop() {
    this.started = false;
    this.clearReconnect();
    if (this.socket && typeof this.socket.close === "function") this.socket.close();
    this.socket = null;
    this.connected = false;
    this.subscribed = false;
  }

  scheduleReconnect() {
    if (!this.started || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectMs);
    if (this.reconnectTimer && typeof this.reconnectTimer.unref === "function") this.reconnectTimer.unref();
  }

  clearReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  parseBoundingBoxes(value) {
    if (!value) return [[[5.0, 60.0], [35.0, 100.0]]];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) && parsed.length ? parsed : [[[5.0, 60.0], [35.0, 100.0]]];
    } catch {
      return [[[5.0, 60.0], [35.0, 100.0]]];
    }
  }

  validPosition(latitude, longitude) {
    return Number.isFinite(Number(latitude)) && Number(latitude) >= -90 && Number(latitude) <= 90 &&
      Number.isFinite(Number(longitude)) && Number(longitude) >= -180 && Number(longitude) <= 180;
  }

  toNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  toPositiveNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
  }
}

module.exports = new AISStreamService();
