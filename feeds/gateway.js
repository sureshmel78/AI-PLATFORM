/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Enterprise Feed Gateway
Version : 2.1.0
===============================================================
*/

const aisProvider = require("../providers/aisProvider");
const freightProvider = require("../providers/freightProvider");
const weatherProvider = require("../providers/weatherProvider");

class EnterpriseFeedGateway {
    constructor() {
        this.lastSnapshot = null;
        this.lastUpdated = null;
    }

    async collectFeeds() {
        const timestamp = new Date().toISOString();
        const results = await Promise.allSettled([
            this.getAISFeed(),
            this.getFreightFeed(),
            this.getWeatherFeed()
        ]);

        const ais = this.resolveFeed(results[0], this.getAISFallback());
        const freight = this.resolveFeed(results[1], this.getFreightFallback());
        const weather = this.resolveFeed(results[2], this.getWeatherFallback());

        const snapshot = {
            timestamp,
            ais,
            freight,
            weather,
            sentiment: this.buildSentimentFeed(freight),
            congestion: this.buildCongestionFeed(ais),
            bunker: this.buildBunkerFeed(),
            status: "ENTERPRISE_FEEDS_COLLECTED"
        };

        this.lastSnapshot = snapshot;
        this.lastUpdated = new Date();
        return snapshot;
    }

    async getEnterpriseFeeds() {
        return this.collectFeeds();
    }

    async getAISFeed() {
        const vessels = await aisProvider.getLiveVessels();
        const safeVessels = Array.isArray(vessels) ? vessels : [];
        const movingVessels = safeVessels.filter(
            vessel => Number(vessel.speed || 0) > 0.5
        ).length;
        const anchoredVessels = safeVessels.length - movingVessels;
        const congestionIndex = this.calculateCongestionIndex(safeVessels);

        return {
            region: "GLOBAL",
            activeVessels: safeVessels.length,
            movingVessels,
            anchoredVessels,
            congestionIndex,
            vessels: safeVessels,
            provider: this.detectProvider(safeVessels, "AIS_PROVIDER"),
            status: "AIS_FEED_ACTIVE"
        };
    }

    async getFreightFeed() {
        let data;

        if (typeof freightProvider.getFreightData === "function") {
            data = await freightProvider.getFreightData();
        } else if (typeof freightProvider.getMarketData === "function") {
            data = await freightProvider.getMarketData();
        } else if (typeof freightProvider.getFreightIndex === "function") {
            data = {
                index: Number(await freightProvider.getFreightIndex() || 0),
                provider: "FREIGHT_PROVIDER",
                status: "FREIGHT_FEED_ACTIVE"
            };
        } else {
            throw new Error("Freight provider method unavailable.");
        }

        return this.normalizeFreightFeed(data);
    }

    async getWeatherFeed() {
        let data;

        if (typeof weatherProvider.getWeather === "function") {
            data = await weatherProvider.getWeather();
        } else if (typeof weatherProvider.getCurrentWeather === "function") {
            data = await weatherProvider.getCurrentWeather();
        } else if (typeof weatherProvider.getWeatherData === "function") {
            data = await weatherProvider.getWeatherData();
        } else {
            throw new Error("Weather provider method unavailable.");
        }

        return this.normalizeWeatherFeed(data);
    }

    normalizeFreightFeed(data = {}) {
        const index = Number(data.index ?? data.freightIndex ?? data.rate ?? 0);
        const sentiment = data.sentiment || data.marketSentiment ||
            this.calculateMarketSentiment(index);

        return {
            ...data,
            index: Number.isFinite(index) ? index : 0,
            freightIndex: Number(data.freightIndex ?? index ?? 0),
            sentiment,
            marketSentiment: sentiment
        };
    }

    normalizeWeatherFeed(data = {}) {
        const risk = data.risk || data.riskLevel || "LOW";

        return {
            ...data,
            risk,
            riskLevel: risk
        };
    }

    resolveFeed(result, fallback) {
        if (
            result &&
            result.status === "fulfilled" &&
            result.value !== null &&
            result.value !== undefined
        ) {
            return result.value;
        }

        if (result && result.status === "rejected") {
            console.error(
                "Feed Gateway Warning:",
                result.reason?.message || result.reason
            );
        }

        return fallback;
    }

    calculateMarketSentiment(index) {
        const value = Number(index || 0);
        if (value >= 1500) return "BULLISH";
        if (value > 0 && value < 900) return "BEARISH";
        return "NEUTRAL";
    }

    buildSentimentFeed(freight = {}) {
        const index = Number(
            freight.index ?? freight.freightIndex ?? freight.rate ?? 0
        );
        const sentiment = freight.sentiment || freight.marketSentiment ||
            this.calculateMarketSentiment(index);

        return {
            sentiment,
            index: Number.isFinite(index) ? index : 0,
            provider: freight.provider || "MARKET_INTELLIGENCE",
            status: "SENTIMENT_ANALYZED"
        };
    }

    buildCongestionFeed(ais = {}) {
        const congestionIndex = Number(ais.congestionIndex || 0);
        let level = "LOW";
        if (congestionIndex >= 75) level = "HIGH";
        else if (congestionIndex >= 50) level = "MEDIUM";

        return {
            level,
            index: congestionIndex,
            activeVessels: Number(ais.activeVessels || 0),
            anchoredVessels: Number(ais.anchoredVessels || 0),
            provider: ais.provider || "AIS_INTELLIGENCE",
            status: "CONGESTION_ANALYZED"
        };
    }

    buildBunkerFeed() {
        return {
            price: 650,
            currency: "USD",
            unit: "MT",
            fuel: "VLSFO",
            provider: "FALLBACK_BUNKER_FEED",
            status: "FALLBACK_DATA"
        };
    }

    calculateCongestionIndex(vessels) {
        if (!Array.isArray(vessels) || vessels.length === 0) return 0;
        const anchored = vessels.filter(
            vessel => Number(vessel.speed || 0) <= 0.5
        ).length;
        return Math.min(100, Math.round((anchored / vessels.length) * 100));
    }

    detectProvider(vessels, fallback) {
        const vessel = vessels.find(item => item && item.provider);
        return vessel?.provider || fallback;
    }

    getAISFallback() {
        return {
            region: "GLOBAL",
            activeVessels: 0,
            movingVessels: 0,
            anchoredVessels: 0,
            congestionIndex: 0,
            vessels: [],
            provider: "AIS_FALLBACK",
            status: "FALLBACK_DATA"
        };
    }

    getFreightFallback() {
        return this.normalizeFreightFeed({
            index: 1200,
            provider: "FREIGHT_FALLBACK",
            status: "FALLBACK_DATA"
        });
    }

    getWeatherFallback() {
        return this.normalizeWeatherFeed({
            temperature: 28,
            windspeed: 15,
            weathercode: 0,
            provider: "WEATHER_FALLBACK",
            status: "FALLBACK_DATA"
        });
    }

    getLatestSnapshot() {
        return this.lastSnapshot;
    }
}

module.exports = new EnterpriseFeedGateway();
