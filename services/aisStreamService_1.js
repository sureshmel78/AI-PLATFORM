/* ===============================================================
Enterprise Maritime AI Intelligence Platform
AISStream Live Ingestion Service
Version : 1.0.3
=============================================================== */

class AISStreamService {
  constructor() {
    this.name = "AISStreamService";
    this.version = "1.0.3";
    this.url = process.env.AISSTREAM_URL || "wss://stream.aisstream.io/v0/stream";
    this.apiKey = process.env.AISSTREAM_API_KEY || "";
    this.boundingBoxes = this.parseBoundingBoxes(process.env.AISSTREAM_BOUNDING_BOXES);
    this.maxVessels = this.toPositiveNumber(process.env.AISSTREAM_MAX_VESSELS, 5000);
    this.staleMs = this.toPositiveNumber(process.env.AISSTREAM_STALE_MS, 900000);
    this.reconnectMs = this.toPositiveNumber(process.env.AISSTREAM_RECONNECT_MS, 15000);
    this.maxReconnectMs = this.toPositiveNumber(process.env.AISSTREAM_MAX_RECONNECT_MS, 900000);
    this.reconnectAttempt = 0;
    this.retryAfterMs = null;
    this.rateLimited = false;
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

  start(WebSocketImpl = null) {
    if (!WebSocketImpl) {
      try {
        WebSocketImpl = require("ws");
      } catch (error) {
        this.lastError = `WEBSOCKET_LIBRARY_UNAVAILABLE: ${error.message}`;
      }
    }
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

      this.bind(socket, "open", () => {
        if (socket !== this.socket) return;
        this.connected = true;
        this.lastError = null;
        this.reconnectAttempt = 0;
        this.retryAfterMs = null;
        this.rateLimited = false;
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

      this.bind(socket, "message", data => {
        if (socket !== this.socket) return;
        this.handleMessage(data?.data ?? data);
      });

      this.bind(socket, "error", error => {
        if (socket !== this.socket) return;
        const errorMessage = error?.message || error?.code || "UNKNOWN";
        this.rateLimited = this.isRateLimitError(error);
        this.retryAfterMs = this.extractRetryAfterMs(error);
        this.lastError = `AISSTREAM_SOCKET_ERROR: ${errorMessage}`;
        console.error("AISStream Service Error:", this.lastError);
      });

      this.bind(socket, "close", (code, reason) => {
        if (socket !== this.socket) return;
        this.connected = false;
        this.subscribed = false;
        this.socket = null;
        const reasonText = Buffer.isBuffer(reason) ? reason.toString("utf8") : String(reason || "");
        const closeError = `AISSTREAM_CLOSED: code=${code ?? "UNKNOWN"}${reasonText ? ` reason=${reasonText}` : ""}`;
        if (!this.rateLimited) this.lastError = closeError;
        console.error("AISStream Service Closed:", closeError);
        if (this.started) this.scheduleReconnect();
      });
    } catch (error) {
      this.lastError = error.message;
      this.connected = false;
      this.subscribed = false;
      this.scheduleReconnect();
    }
  }

  bind(socket, eventName, handler) {
    if (socket && typeof socket.on === "function") {
      socket.on(eventName, handler);
      return;
    }
    if (socket && typeof socket.addEventListener === "function") {
      socket.addEventListener(eventName, handler);
      return;
    }
    throw new Error(`WEBSOCKET_EVENT_BINDING_UNAVAILABLE: ${eventName}`);
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
      reconnectAttempt: this.reconnectAttempt,
      rateLimited: this.rateLimited,
      retryAfterMs: this.retryAfterMs,
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

    this.reconnectAttempt += 1;
    const exponentialDelay = Math.min(
      this.reconnectMs * Math.pow(2, Math.max(0, this.reconnectAttempt - 1)),
      this.maxReconnectMs
    );
    const delay = Math.min(
      Math.max(exponentialDelay, this.retryAfterMs || 0),
      this.maxReconnectMs
    );

    console.log(
      `AISStream Service Reconnect Scheduled: attempt=${this.reconnectAttempt} delayMs=${delay}` +
      (this.rateLimited ? " reason=RATE_LIMITED" : "")
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);

    if (this.reconnectTimer && typeof this.reconnectTimer.unref === "function") {
      this.reconnectTimer.unref();
    }
  }

  isRateLimitError(error) {
    const message = String(error?.message || error?.code || "");
    return /(?:^|\D)429(?:\D|$)/.test(message);
  }

  extractRetryAfterMs(error) {
    const retryAfter = error?.response?.headers?.["retry-after"] ??
      error?.headers?.["retry-after"];

    if (retryAfter === null || retryAfter === undefined || retryAfter === "") return null;

    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;

    const retryDate = new Date(retryAfter).getTime();
    if (!Number.isFinite(retryDate)) return null;

    return Math.max(0, retryDate - Date.now());
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
