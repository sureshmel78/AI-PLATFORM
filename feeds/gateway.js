/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Enterprise Feed Gateway
Version : 2.0.0
===============================================================
*/

const aisProvider =
require("../providers/aisProvider");

const freightProvider =
require("../providers/freightProvider");

const weatherProvider =
require("../providers/weatherProvider");

const bunkerProvider =
require("../providers/bunkerProvider");


class EnterpriseFeedGateway {

    constructor() {

        this.lastSnapshot = null;

        this.lastUpdated = null;

    }


    /*
    ===============================================================
    Collect Enterprise Feeds
    ===============================================================
    */

    async collectFeeds() {

        const timestamp =
        new Date().toISOString();

        const results =
        await Promise.allSettled([

            this.getAISFeed(),

            this.getFreightFeed(),

            this.getWeatherFeed(),

            this.getBunkerFeed()

        ]);


        const ais =
        this.resolveFeed(

            results[0],

            this.getAISFallback()

        );


        const freight =
        this.resolveFeed(

            results[1],

            this.getFreightFallback()

        );


        const weather =
        this.resolveFeed(

            results[2],

            this.getWeatherFallback()

        );


        const bunker =
        this.resolveFeed(

            results[3],

            this.getBunkerFallback()

        );


        const snapshot = {

            timestamp,

            ais,

            freight,

            weather,

            sentiment:
            this.buildSentimentFeed(
                freight
            ),

            congestion:
            this.buildCongestionFeed(
                ais
            ),

            bunker,

            status:
            "ENTERPRISE_FEEDS_COLLECTED"

        };


        this.lastSnapshot =
        snapshot;

        this.lastUpdated =
        new Date();


        return snapshot;

    }


    /*
    ===============================================================
    Alias For Existing Engines
    ===============================================================
    */

    async getEnterpriseFeeds() {

        return this.collectFeeds();

    }


    /*
    ===============================================================
    AIS Feed
    ===============================================================
    */

    async getAISFeed() {

        const vessels =
        await aisProvider
        .getLiveVessels();


        const safeVessels =
        Array.isArray(vessels)
        ? vessels
        : [];


        const movingVessels =
        safeVessels.filter(

            vessel =>

            Number(
                vessel.speed || 0
            ) > 0.5

        ).length;


        const anchoredVessels =
        safeVessels.length -
        movingVessels;


        const congestionIndex =
        this.calculateCongestionIndex(
            safeVessels
        );


        return {

            region:
            "GLOBAL",

            activeVessels:
            safeVessels.length,

            movingVessels,

            anchoredVessels,

            congestionIndex,

            vessels:
            safeVessels,

            provider:
            this.detectProvider(
                safeVessels,
                "AIS_PROVIDER"
            ),

            status:
            "AIS_FEED_ACTIVE"

        };

    }


    /*
    ===============================================================
    Freight Feed
    ===============================================================
    */

    async getFreightFeed() {

        if (

            typeof freightProvider
            .getFreightData === "function"

        ) {

            return await freightProvider
            .getFreightData();

        }


        if (

            typeof freightProvider
            .getMarketData === "function"

        ) {

            return await freightProvider
            .getMarketData();

        }


        if (

            typeof freightProvider
            .getFreightIndex === "function"

        ) {

            const index =
            await freightProvider
            .getFreightIndex();


            return {

                index:
                Number(index || 0),

                provider:
                "FREIGHT_PROVIDER",

                status:
                "FREIGHT_FEED_ACTIVE"

            };

        }


        throw new Error(
            "Freight provider method unavailable."
        );

    }


    /*
    ===============================================================
    Weather Feed
    ===============================================================
    */

    async getWeatherFeed() {

        if (

            typeof weatherProvider
            .getWeather === "function"

        ) {

            return await weatherProvider
            .getWeather();

        }


        if (

            typeof weatherProvider
            .getCurrentWeather === "function"

        ) {

            return await weatherProvider
            .getCurrentWeather();

        }


        if (

            typeof weatherProvider
            .getWeatherData === "function"

        ) {

            return await weatherProvider
            .getWeatherData();

        }


        throw new Error(
            "Weather provider method unavailable."
        );

    }


    /*
    ===============================================================
    Resolve Feed
    ===============================================================
    */

    resolveFeed(
        result,
        fallback
    ) {

        if (

            result &&
            result.status === "fulfilled" &&
            result.value !== null &&
            result.value !== undefined

        ) {

            return result.value;

        }


        if (

            result &&
            result.status === "rejected"

        ) {

            console.error(

                "Feed Gateway Warning:",

                result.reason
                ?.message ||
                result.reason

            );

        }


        return fallback;

    }


    /*
    ===============================================================
    Market Sentiment
    ===============================================================
    */

    buildSentimentFeed(
        freight
    ) {

        const index =
        Number(
            freight?.index ||
            freight?.freightIndex ||
            freight?.rate ||
            0
        );


        let sentiment =
        "NEUTRAL";


        if (
            index >= 1500
        ) {

            sentiment =
            "BULLISH";

        }

        else if (
            index > 0 &&
            index < 900
        ) {

            sentiment =
            "BEARISH";

        }


        return {

            sentiment,

            index,

            provider:
            freight?.provider ||
            "MARKET_INTELLIGENCE",

            status:
            "SENTIMENT_ANALYZED"

        };

    }


    /*
    ===============================================================
    Congestion Feed
    ===============================================================
    */

    buildCongestionFeed(
        ais
    ) {

        const congestionIndex =
        Number(
            ais?.congestionIndex || 0
        );


        let level =
        "LOW";


        if (
            congestionIndex >= 75
        ) {

            level =
            "HIGH";

        }

        else if (
            congestionIndex >= 50
        ) {

            level =
            "MEDIUM";

        }


        return {

            level,

            index:
            congestionIndex,

            activeVessels:
            Number(
                ais?.activeVessels || 0
            ),

            anchoredVessels:
            Number(
                ais?.anchoredVessels || 0
            ),

            provider:
            ais?.provider ||
            "AIS_INTELLIGENCE",

            status:
            "CONGESTION_ANALYZED"

        };

    }


    /*
    ===============================================================
    Bunker Feed
    ===============================================================
    */

    async getBunkerFeed() {

        return await bunkerProvider
        .getBunkerData();

    }


    getBunkerFallback() {

        return bunkerProvider
        .getFallbackData();

    }


    /*
    ===============================================================
    Congestion Index
    ===============================================================
    */

    calculateCongestionIndex(
        vessels
    ) {

        if (

            !Array.isArray(vessels) ||
            vessels.length === 0

        ) {

            return 0;

        }


        const anchored =
        vessels.filter(

            vessel =>

            Number(
                vessel.speed || 0
            ) <= 0.5

        ).length;


        return Math.min(

            100,

            Math.round(

                (
                    anchored /
                    vessels.length
                ) * 100

            )

        );

    }


    /*
    ===============================================================
    Detect AIS Provider
    ===============================================================
    */

    detectProvider(
        vessels,
        fallback
    ) {

        const vessel =
        vessels.find(

            item =>

            item &&
            item.provider

        );


        return vessel?.provider ||
        fallback;

    }


    /*
    ===============================================================
    AIS Fallback
    ===============================================================
    */

    getAISFallback() {

        return {

            region:
            "GLOBAL",

            activeVessels:
            0,

            movingVessels:
            0,

            anchoredVessels:
            0,

            congestionIndex:
            0,

            vessels:
            [],

            provider:
            "AIS_FALLBACK",

            status:
            "FALLBACK_DATA"

        };

    }


    /*
    ===============================================================
    Freight Fallback
    ===============================================================
    */

    getFreightFallback() {

        return {

            index:
            1200,

            provider:
            "FREIGHT_FALLBACK",

            status:
            "FALLBACK_DATA"

        };

    }


    /*
    ===============================================================
    Weather Fallback
    ===============================================================
    */

    getWeatherFallback() {

        return {

            temperature:
            28,

            windspeed:
            15,

            weathercode:
            0,

            provider:
            "WEATHER_FALLBACK",

            status:
            "FALLBACK_DATA"

        };

    }


    /*
    ===============================================================
    Latest Feed Snapshot
    ===============================================================
    */

    getLatestSnapshot() {

        return this.lastSnapshot;

    }

}


const enterpriseFeedGateway =
new EnterpriseFeedGateway();

async function externalIntelligence() {

    const snapshot =
    await enterpriseFeedGateway
    .getEnterpriseFeeds();

    return {
        sentiment: {
            state: snapshot.sentiment?.sentiment || "NEUTRAL",
            updated: snapshot.timestamp
        },
        freight: {
            index: Number(snapshot.freight?.index || snapshot.freight?.freightIndex || 0)
        },
        congestion: {
            level: Number(snapshot.ais?.congestionIndex || 0)
        },
        bunker: snapshot.bunker
    };

}

module.exports = enterpriseFeedGateway;
module.exports.externalIntelligence = externalIntelligence;