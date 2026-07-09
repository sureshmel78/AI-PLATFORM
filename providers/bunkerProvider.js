/**
 * Enterprise Maritime AI Intelligence Platform
 * Bunker Market Intelligence Provider
 * Version: 3.0.0
 */

const axios = require("axios");

class BunkerProvider {
    constructor() {
        this.name = "BunkerMarketIntelligenceProvider";
        this.version = "3.0.0";
        this.apiUrl = process.env.BUNKER_API_URL || "";
        this.apiKey = process.env.BUNKER_API_KEY || "";
        this.apiKeyHeader = process.env.BUNKER_API_KEY_HEADER || "x-api-key";
        this.bearerToken = process.env.BUNKER_BEARER_TOKEN || "";
        this.timeoutMs = Number(process.env.BUNKER_API_TIMEOUT_MS || 8000);
        this.defaultPort = process.env.BUNKER_DEFAULT_PORT || "SINGAPORE";
        this.defaultFuel = process.env.BUNKER_DEFAULT_FUEL || "VLSFO";
    }

    safeNumber(value, fallback = 0) {
        const number = Number(value);
        return Number.isFinite(number) ? number : fallback;
    }

    buildHeaders() {
        const headers = { Accept: "application/json" };
        if (this.apiKey) headers[this.apiKeyHeader] = this.apiKey;
        if (this.bearerToken) headers.Authorization = `Bearer ${this.bearerToken}`;
        return headers;
    }

    extractPayload(responseData) {
        if (Array.isArray(responseData)) return responseData[0] || {};
        if (Array.isArray(responseData?.data)) return responseData.data[0] || {};
        return responseData?.data || responseData?.result || responseData || {};
    }

    normalize(payload = {}, isLive = false) {
        const price = this.safeNumber(
            payload.price ?? payload.value ?? payload.rate ?? payload.bunkerPrice ?? payload.close,
            650
        );
        const changePercent = this.safeNumber(
            payload.changePercent ?? payload.change_pct ?? payload.percentChange ?? payload.change,
            0
        );
        let trend = "STABLE";
        if (changePercent > 0.5) trend = "RISING";
        else if (changePercent < -0.5) trend = "FALLING";

        return {
            engine: this.name,
            version: this.version,
            price: Number(price.toFixed(2)),
            currency: String(payload.currency || "USD").toUpperCase(),
            unit: String(payload.unit || "MT").toUpperCase(),
            fuel: String(payload.fuel || payload.grade || this.defaultFuel).toUpperCase(),
            port: String(payload.port || payload.location || this.defaultPort).toUpperCase(),
            changePercent: Number(changePercent.toFixed(2)),
            trend,
            provider: isLive ? String(payload.provider || "BUNKER_API") : "BUNKER_BENCHMARK_FALLBACK",
            sourceType: isLive ? "LIVE_API" : "BENCHMARK_PROFILE",
            isLive,
            status: isLive ? "BUNKER_FEED_ACTIVE" : "FALLBACK_DATA",
            timestamp: payload.timestamp || payload.updatedAt || new Date().toISOString()
        };
    }

    getFallbackData() {
        return this.normalize({
            price: 650,
            currency: "USD",
            unit: "MT",
            fuel: this.defaultFuel,
            port: this.defaultPort,
            changePercent: 0
        }, false);
    }

    async getBunkerData() {
        if (!this.apiUrl) return this.getFallbackData();
        try {
            const response = await axios.get(this.apiUrl, {
                headers: this.buildHeaders(),
                timeout: this.timeoutMs,
                params: {
                    port: this.defaultPort,
                    fuel: this.defaultFuel
                }
            });
            return this.normalize(this.extractPayload(response.data), true);
        } catch (error) {
            console.error("Bunker Provider Warning:", error.message);
            return this.getFallbackData();
        }
    }

    async getBunkerPrice() {
        const data = await this.getBunkerData();
        return data.price;
    }

    getEngineInfo() {
        return {
            name: this.name,
            version: this.version,
            configured: Boolean(this.apiUrl),
            defaultPort: this.defaultPort,
            defaultFuel: this.defaultFuel
        };
    }
}

module.exports = new BunkerProvider();
