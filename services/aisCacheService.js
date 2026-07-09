/*
===============================================================
Enterprise Maritime AI Intelligence Platform
AIS Cache Service
Version : 3.0.0
===============================================================
*/

const aisProvider = require("../providers/aisProvider");

class AISCacheService {
    constructor() {
        this.name = "AISCacheService";
        this.version = "3.0.0";
        this.vessels = [];
        this.lastUpdated = null;
        this.started = false;
        this.refreshTimer = null;
        this.refreshInterval = this.toPositiveNumber(process.env.AIS_CACHE_REFRESH_MS, 60000);
        this.lastError = null;
        this.refreshPromise = null;
    }

    start() {
        if (this.started) return;
        this.started = true;
        console.log("AIS Cache Service Starting");
        this.refresh().catch(error => console.error("AIS Cache Initial Refresh Error:", error.message));
        this.refreshTimer = setInterval(() => {
            this.refresh().catch(error => console.error("AIS Cache Refresh Error:", error.message));
        }, this.refreshInterval);
        if (this.refreshTimer && typeof this.refreshTimer.unref === "function") this.refreshTimer.unref();
        console.log("AIS Cache Service Active");
    }

    async refresh() {
        if (this.refreshPromise) return this.refreshPromise;
        this.refreshPromise = this.performRefresh();
        try {
            return await this.refreshPromise;
        } finally {
            this.refreshPromise = null;
        }
    }

    async performRefresh() {
        try {
            const vessels = await aisProvider.getLiveVessels();
            if (!Array.isArray(vessels)) throw new Error("AIS provider returned invalid vessel data.");
            const normalized = vessels
                .map(vessel => this.normalizeVessel(vessel))
                .filter(vessel => this.hasValidPosition(vessel));
            this.vessels = normalized;
            this.lastUpdated = new Date();
            this.lastError = null;
            console.log(`AIS Cache Updated: ${this.vessels.length} vessels`);
            return this.getVessels();
        } catch (error) {
            this.lastError = error.message;
            console.error("AIS Cache Service Error:", error.message);
            throw error;
        }
    }

    normalizeVessel(vessel = {}) {
        return {
            ...vessel,
            name: vessel.name || vessel.vesselName || "UNKNOWN VESSEL",
            imo: vessel.imo || vessel.IMO || null,
            mmsi: vessel.mmsi || vessel.MMSI || null,
            latitude: this.toNumber(vessel.latitude ?? vessel.lat),
            longitude: this.toNumber(vessel.longitude ?? vessel.lng ?? vessel.lon),
            speed: this.toNumber(vessel.speed ?? vessel.sog) ?? 0,
            course: this.toNumber(vessel.course ?? vessel.cog),
            heading: this.toNumber(vessel.heading),
            destination: vessel.destination || "-",
            eta: vessel.eta || null,
            navigationStatus: vessel.navigationStatus || vessel.navStatus || "UNKNOWN",
            vesselType: vessel.vesselType || vessel.type || "UNKNOWN",
            provider: vessel.provider || "AIS_PROVIDER",
            sourceType: vessel.sourceType || "UNKNOWN",
            isLive: vessel.isLive === true,
            timestamp: vessel.timestamp || new Date().toISOString()
        };
    }

    hasValidPosition(vessel) {
        return Number.isFinite(vessel.latitude) && vessel.latitude >= -90 && vessel.latitude <= 90 &&
            Number.isFinite(vessel.longitude) && vessel.longitude >= -180 && vessel.longitude <= 180;
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

    getVessels() { return this.vessels.map(vessel => ({ ...vessel })); }
    getLiveVessels() { return this.getVessels(); }
    getMovingVessels() { return this.getVessels().filter(vessel => Number(vessel.speed || 0) > 0.5); }
    getAnchoredVessels() { return this.getVessels().filter(vessel => Number(vessel.speed || 0) <= 0.5); }

    getStatus() {
        return {
            name: this.name,
            version: this.version,
            started: this.started,
            vesselCount: this.vessels.length,
            movingVessels: this.getMovingVessels().length,
            anchoredVessels: this.getAnchoredVessels().length,
            liveVessels: this.vessels.filter(vessel => vessel.isLive).length,
            lastUpdated: this.lastUpdated,
            lastError: this.lastError,
            refreshInterval: this.refreshInterval,
            status: this.lastError ? "DEGRADED" : "ACTIVE"
        };
    }

    stop() {
        if (this.refreshTimer) clearInterval(this.refreshTimer);
        this.refreshTimer = null;
        this.started = false;
        console.log("AIS Cache Service Stopped");
    }
}

module.exports = new AISCacheService();
