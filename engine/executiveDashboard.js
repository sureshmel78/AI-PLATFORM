/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Executive Dashboard Engine
Version : 2.2.0
===============================================================

PURPOSE
---------------------------------------------------------------
Enterprise executive dashboard intelligence aggregation.

INTEGRATIONS
---------------------------------------------------------------
1. Enterprise Feed Gateway
2. Congestion Intelligence Engine
3. Vessel Risk Engine
4. Business Intelligence Engine v2.0.0
5. Market Opportunity Engine v2.0.0 through Business Intelligence

FROZEN MODULE RULE
---------------------------------------------------------------
Verified dependency modules must not be modified.
Dashboard compatibility is handled inside this engine.
===============================================================
*/

const gateway =
require("../feeds/gateway");

const congestionEngine =
require("./congestionEngine");

const vesselRiskEngine =
require("./vesselRiskEngine");

const businessIntelligenceEngine =
require("./businessIntelligenceEngine");


class ExecutiveDashboard {


    constructor() {

        this.name =
        "ExecutiveDashboard";

        this.version =
        "2.2.0";

        this.status =
        "ACTIVE";

    }


    /*
    ===============================================================
    SAFE VALUE
    ===============================================================
    */

    safeValue(
        value,
        fallback
    ) {

        return value !== undefined
        && value !== null

        ? value

        : fallback;

    }


    /*
    ===============================================================
    GENERATE EXECUTIVE DASHBOARD
    ===============================================================
    */

    async generateDashboard() {

        const [

            enterpriseFeeds,

            congestionIntelligence

        ] = await Promise.all([

            gateway
            .getEnterpriseFeeds(),

            congestionEngine
            .generateCongestionIntelligence()

        ]);


        /*
        ===============================================================
        SAFE ENTERPRISE FEEDS
        ===============================================================
        */

        const safeEnterpriseFeeds =

        enterpriseFeeds

        && typeof enterpriseFeeds === "object"

        ? enterpriseFeeds

        : {};


        const aisFeed =

        safeEnterpriseFeeds
        .ais || {};


        const freightFeed =

        safeEnterpriseFeeds
        .freight || {};


        const weatherFeed =

        safeEnterpriseFeeds
        .weather || {};


        /*
        ===============================================================
        CONGESTION RISK INTELLIGENCE
        ===============================================================
        */

        const congestionRisk =

        congestionIntelligence

        && congestionIntelligence.portRisk

        && congestionIntelligence.portRisk.riskLevel

        ? congestionIntelligence.portRisk.riskLevel

        : "LOW";


        /*
        ===============================================================
        VESSEL RISK INTELLIGENCE
        ===============================================================
        */

        const vesselRisk =

        await vesselRiskEngine
        .generateRiskAssessment(

            congestionRisk

        );


        const voyageRisk =

        vesselRisk

        && vesselRisk.voyageRisk

        && vesselRisk.voyageRisk.overallRisk

        ? vesselRisk.voyageRisk.overallRisk

        : "LOW";


        /*
        ===============================================================
        BUSINESS INTELLIGENCE
        ===============================================================
        */

        const businessIntelligence =

        businessIntelligenceEngine
        .generateBusinessIntelligence();


        const businessExecutiveSummary =

        businessIntelligence

        && businessIntelligence.executiveSummary

        ? businessIntelligence.executiveSummary

        : {};


        /*
        ===============================================================
        MARKET SENTIMENT
        ===============================================================
        */

        const marketSentiment =

        freightFeed.sentiment

        || "STABLE";


        /*
        ===============================================================
        WEATHER RISK
        ===============================================================
        */

        const weatherRisk =

        weatherFeed.risk

        || "LOW";


        /*
        ===============================================================
        MARKET OPPORTUNITY INTELLIGENCE
        ===============================================================
        */

        const opportunityScore =

        this.safeValue(

            businessExecutiveSummary
            .opportunityScore,

            0

        );


        const opportunityClassification =

        this.safeValue(

            businessExecutiveSummary
            .opportunityClassification,

            "WEAK"

        );


        const recommendedAction =

        this.safeValue(

            businessExecutiveSummary
            .recommendedAction,

            "AVOID OPPORTUNITY"

        );


        const opportunityConfidence =

        this.safeValue(

            businessExecutiveSummary
            .confidence,

            0

        );


        const highestRiskPort =

        this.safeValue(

            businessExecutiveSummary
            .highestRiskPort,

            "NONE"

        );


        /*
        ===============================================================
        OVERALL PLATFORM STATUS
        ===============================================================
        */

        let overallStatus =

        "GREEN";


        if (

            congestionRisk === "HIGH"

            ||

            voyageRisk === "HIGH"

        ) {

            overallStatus =

            "RED";

        }

        else if (

            congestionRisk === "MEDIUM"

            ||

            voyageRisk === "MEDIUM"

        ) {

            overallStatus =

            "AMBER";

        }


        /*
        ===============================================================
        EXECUTIVE DASHBOARD RESPONSE
        ===============================================================
        */

        return {

            engine:

            this.name,


            version:

            this.version,


            status:

            this.status,


            platform:

            "Enterprise Maritime AI Intelligence Platform",


            overallStatus,


            executiveSummary: {


                activeVessels:

                this.safeValue(

                    aisFeed.activeVessels,

                    0

                ),


                marketSentiment,


                weatherRisk,


                congestionRisk,


                voyageRisk,


                opportunityScore,


                opportunityClassification,


                recommendedAction,


                opportunityConfidence,


                highestRiskPort

            },


            marketOpportunity:

            businessIntelligence
            .marketOpportunity || null,


            congestionIntelligence,


            vesselRisk,


            businessIntelligence,


            generatedAt:

            new Date()
            .toISOString()

        };

    }


    /*
    ===============================================================
    ENGINE INFORMATION
    ===============================================================
    */

    getEngineInfo() {

        return {

            name:

            this.name,

            version:

            this.version,

            status:

            this.status,

            integrations: [

                "EnterpriseFeedGateway",

                "CongestionEngine",

                "VesselRiskEngine",

                "BusinessIntelligenceEngine v2.0.0",

                "MarketOpportunityEngine v2.0.0"

            ]

        };

    }

}


module.exports =

new ExecutiveDashboard();