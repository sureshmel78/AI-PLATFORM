/*
===============================================================
Enterprise Maritime AI Intelligence Platform
AIS Intelligence Provider
Version : 3.0.0
===============================================================
*/

const axios = require("axios");

class AISProvider {
    constructor() {
        this.name = "AISProvider";
        this.version = "3.0.0";
        this.providerName = "ENTERPRISE_AIS_PROVIDER";
        this.apiUrl = process.env.AIS_API_URL || "";
        this.apiKey = process.env.AIS_API_KEY || "";
        this.apiKeyHeader = process.env.AIS_API_KEY_HEADER || "Authorization";
        this.authScheme = process.env.AIS_AUTH_SCHEME || "Bearer";
        this.timeout = this.toPositiveNumber(process.env.AIS_API_TIMEOUT, 10000);
        this.apiEnabled = Boolean(this.apiUrl);
    }

    async getLiveVessels() {
        if (!this.apiEnabled) return this.getFallbackVessels();
        try {
            const vessels = await this.fetchLiveAIS();
            if (!Array.isArray(vessels) || vessels.length === 0) {
                throw new Error("Live AIS API returned no usable vessels.");
            }
            return vessels;
        } catch (error) {
            console.error("AIS Provider Error:", error.message);
            return this.getFallbackVessels();
        }
    }

    async fetchLiveAIS() {
        const response = await axios.get(this.apiUrl, {
            headers: this.buildHeaders(),
            timeout: this.timeout
        });
        return this.extractVessels(response.data)
            .map(vessel => this.normalizeVessel(vessel, "AIS_LIVE_API"))
            .filter(vessel => this.isUsableVessel(vessel));
    }

    buildHeaders() {
        if (!this.apiKey) return {};
        const value = this.authScheme
            ? `${this.authScheme} ${this.apiKey}`.trim()
            : this.apiKey;
        return { [this.apiKeyHeader]: value };
    }

    extractVessels(payload) {
        if (Array.isArray(payload)) return payload;
        if (!payload || typeof payload !== "object") return [];
        const candidates = [
            payload.vessels,
            payload.data,
            payload.results,
            payload.features,
            payload.data?.vessels,
            payload.data?.results
        ];
        const result = candidates.find(Array.isArray);
        return result || [];
    }

    normalizeVessel(raw = {}, provider = "AIS_PROVIDER") {
        const properties = raw.properties || {};
        const geometryCoordinates = Array.isArray(raw.geometry?.coordinates)
            ? raw.geometry.coordinates
            : [];
        const data = { ...properties, ...raw };
        const latitude = this.toNumber(
            data.latitude ?? data.lat ?? data.LATITUDE ?? geometryCoordinates[1]
        );
        const longitude = this.toNumber(
            data.longitude ?? data.lng ?? data.lon ?? data.LONGITUDE ?? geometryCoordinates[0]
        );
        return {
            name: data.name || data.vesselName || data.shipName || data.NAME || "UNKNOWN VESSEL",
            imo: data.imo || data.IMO || null,
            mmsi: data.mmsi || data.MMSI || null,
            latitude,
            longitude,
            destination: data.destination || data.DESTINATION || "-",
            speed: this.toNumber(data.speed ?? data.sog ?? data.SOG) ?? 0,
            course: this.toNumber(data.course ?? data.cog ?? data.COG),
            heading: this.toNumber(data.heading ?? data.trueHeading ?? data.HEADING),
            navigationStatus: data.navigationStatus || data.navStatus || data.NAVSTAT || "UNKNOWN",
            vesselType: data.vesselType || data.shipType || data.type || data.SHIPTYPE || "UNKNOWN",
            provider: data.provider || provider,
            sourceType: provider === "AIS_LIVE_API" ? "LIVE_API" : "BENCHMARK_PROFILE",
            isLive: provider === "AIS_LIVE_API",
            timestamp: data.timestamp || data.time || data.lastUpdate || new Date().toISOString()
        };
    }

    isUsableVessel(vessel) {
        return vessel &&
            Number.isFinite(vessel.latitude) && vessel.latitude >= -90 && vessel.latitude <= 90 &&
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

    getFallbackVessels() {
        const timestamp = new Date().toISOString();
        const profiles = [
            ["MV OCEAN ENTERPRISE", "IMO9876543", "419000101", 8.754, 78.195, "TUTICORIN", 11.8, 42, 40, "UNDER WAY USING ENGINE", "BULK CARRIER"],
            ["MV GLOBAL TRADER", "IMO9765432", "563000202", 1.264, 103.840, "SINGAPORE", 14.2, 95, 94, "UNDER WAY USING ENGINE", "CONTAINER SHIP"],
            ["MV MARITIME STAR", "IMO9654321", "419000303", 6.927, 79.844, "COLOMBO", 0, 0, 180, "AT ANCHOR", "GENERAL CARGO"],
            ["MV ASIA VOYAGER", "IMO9543210", "477000404", 31.230, 121.490, "SHANGHAI", 12.5, 160, 158, "UNDER WAY USING ENGINE", "BULK CARRIER"],
            ["MV GULF NAVIGATOR", "IMO9432109", "470000505", 25.010, 55.060, "JEBEL ALI", 0.2, 270, 268, "MOORED", "CONTAINER SHIP"]
        ];
        return profiles.map(profile => this.normalizeVessel({
            name: profile[0], imo: profile[1], mmsi: profile[2], latitude: profile[3],
            longitude: profile[4], destination: profile[5], speed: profile[6], course: profile[7],
            heading: profile[8], navigationStatus: profile[9], vesselType: profile[10], timestamp
        }, "AIS_FALLBACK"));
    }

    getStatus() {
        return {
            name: this.name,
            version: this.version,
            provider: this.providerName,
            apiEnabled: this.apiEnabled,
            mode: this.apiEnabled ? "LIVE_API" : "FALLBACK",
            apiConfigured: Boolean(this.apiUrl),
            status: "AIS_PROVIDER_ACTIVE"
        };
    }
}

module.exports = new AISProvider();
