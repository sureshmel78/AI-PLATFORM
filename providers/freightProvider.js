/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Freight Intelligence Provider
Version : 3.0.0
===============================================================
*/

const axios = require("axios");

class FreightProvider {
    constructor() {
        this.providerName = "ENTERPRISE_FREIGHT_PROVIDER";
        this.apiUrl = String(process.env.FREIGHT_API_URL || "").trim();
        this.apiKey = String(process.env.FREIGHT_API_KEY || "").trim();
        this.apiKeyHeader = String(process.env.FREIGHT_API_KEY_HEADER || "x-api-key").trim();
        this.bearerToken = String(process.env.FREIGHT_API_BEARER_TOKEN || "").trim();
        this.timeoutMs = this.safePositiveNumber(process.env.FREIGHT_API_TIMEOUT_MS, 8000);
        this.fallbackIndex = this.safePositiveNumber(process.env.FREIGHT_FALLBACK_INDEX, 1280);
        this.market = String(process.env.FREIGHT_MARKET || "DRY_BULK").trim().toUpperCase();
    }

    safeNumber(value, fallback = 0) {
        const number = Number(value);
        return Number.isFinite(number) ? number : fallback;
    }

    safePositiveNumber(value, fallback) {
        const number = Number(value);
        return Number.isFinite(number) && number > 0 ? number : fallback;
    }

    normalizeSentiment(value, index) {
        const text = String(value || "").trim().toUpperCase();
        const aliases = {
            STRONG: "BULLISH",
            POSITIVE: "BULLISH",
            UP: "BULLISH",
            RISING: "BULLISH",
            WEAK: "BEARISH",
            NEGATIVE: "BEARISH",
            DOWN: "BEARISH",
            FALLING: "BEARISH",
            STABLE: "NEUTRAL",
            FLAT: "NEUTRAL"
        };
        if (["BULLISH", "BEARISH", "NEUTRAL"].includes(text)) return text;
        if (aliases[text]) return aliases[text];
        if (index >= 1500) return "BULLISH";
        if (index > 0 && index < 900) return "BEARISH";
        return "NEUTRAL";
    }

    normalizeTrend(value, sentiment) {
        const text = String(value || "").trim().toUpperCase();
        if (["RISING", "STABLE", "FALLING"].includes(text)) return text;
        if (["UP", "POSITIVE", "STRONG"].includes(text)) return "RISING";
        if (["DOWN", "NEGATIVE", "WEAK"].includes(text)) return "FALLING";
        if (sentiment === "BULLISH") return "RISING";
        if (sentiment === "BEARISH") return "FALLING";
        return "STABLE";
    }

    pick(source, paths) {
        for (const path of paths) {
            const value = path.split(".").reduce(
                (current, key) => current !== null && current !== undefined ? current[key] : undefined,
                source
            );
            if (value !== undefined && value !== null && value !== "") return value;
        }
        return undefined;
    }

    normalizeFreightData(raw = {}, metadata = {}) {
        const source = raw && typeof raw === "object" ? raw : {};
        const index = this.safeNumber(this.pick(source, [
            "index", "freightIndex", "rate", "value", "price",
            "data.index", "data.freightIndex", "data.rate", "data.value", "data.price",
            "result.index", "result.freightIndex", "result.rate", "result.value"
        ]), this.fallbackIndex);
        const sentiment = this.normalizeSentiment(this.pick(source, [
            "sentiment", "marketSentiment", "data.sentiment", "data.marketSentiment",
            "result.sentiment", "result.marketSentiment"
        ]), index);
        const trend = this.normalizeTrend(this.pick(source, [
            "trend", "direction", "data.trend", "data.direction", "result.trend"
        ]), sentiment);

        return {
            index,
            freightIndex: index,
            market: String(this.pick(source, ["market", "segment", "data.market", "data.segment"]) || this.market).toUpperCase(),
            sentiment,
            marketSentiment: sentiment,
            trend,
            volatility: String(this.pick(source, ["volatility", "data.volatility", "result.volatility"]) || "NORMAL").toUpperCase(),
            rate: this.safeNumber(this.pick(source, ["rate", "price", "data.rate", "data.price"]), index),
            currency: String(this.pick(source, ["currency", "data.currency", "result.currency"]) || "USD").toUpperCase(),
            unit: String(this.pick(source, ["unit", "data.unit", "result.unit"]) || "INDEX").toUpperCase(),
            provider: metadata.provider || this.pick(source, ["provider", "source", "data.provider"]) || this.providerName,
            sourceType: metadata.sourceType || "LIVE_API",
            isLive: metadata.isLive === true,
            timestamp: this.pick(source, ["timestamp", "updatedAt", "date", "data.timestamp", "data.updatedAt"]) || new Date().toISOString(),
            status: metadata.status || "FREIGHT_DATA_NORMALIZED"
        };
    }

    buildHeaders() {
        const headers = { Accept: "application/json" };
        if (this.apiKey) headers[this.apiKeyHeader] = this.apiKey;
        if (this.bearerToken) headers.Authorization = `Bearer ${this.bearerToken}`;
        return headers;
    }

    async fetchLiveFreightData() {
        if (!this.apiUrl) throw new Error("FREIGHT_API_URL is not configured.");
        const response = await axios.get(this.apiUrl, {
            headers: this.buildHeaders(),
            timeout: this.timeoutMs
        });
        return this.normalizeFreightData(response.data, {
            provider: "FREIGHT_LIVE_API",
            sourceType: "LIVE_API",
            isLive: true,
            status: "LIVE_DATA"
        });
    }

    getFallbackFreightData(reason = "LIVE_API_NOT_CONFIGURED") {
        return this.normalizeFreightData({
            index: this.fallbackIndex,
            market: this.market,
            rate: this.fallbackIndex,
            currency: "USD",
            unit: "INDEX"
        }, {
            provider: "FREIGHT_FALLBACK",
            sourceType: "BENCHMARK_FALLBACK",
            isLive: false,
            status: "FALLBACK_DATA"
        });
    }

    async getFreightData() {
        if (!this.apiUrl) return this.getFallbackFreightData();
        try {
            return await this.fetchLiveFreightData();
        } catch (error) {
            console.error("Freight Provider Warning:", error.message);
            return this.getFallbackFreightData("LIVE_API_ERROR");
        }
    }

    async getMarketData() {
        return this.getFreightData();
    }

    async getFreightIndex() {
        const freightData = await this.getFreightData();
        return Number(freightData.index || 0);
    }

    getStatus() {
        return {
            provider: this.providerName,
            apiConfigured: Boolean(this.apiUrl),
            mode: this.apiUrl ? "LIVE_API_READY" : "FALLBACK",
            market: this.market,
            timeoutMs: this.timeoutMs,
            status: "FREIGHT_PROVIDER_ACTIVE"
        };
    }
}

module.exports = new FreightProvider();
