/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Executive Dashboard Engine
Version : 2.0.1
===============================================================
*/

const gateway =
require('../feeds/gateway');

const congestionEngine =
require('./congestionEngine');

const vesselRiskEngine =
require('./vesselRiskEngine');

const businessIntelligenceEngine =
require('./businessIntelligenceEngine');


class ExecutiveDashboard {

    /*
    ===============================================================
    Generate Executive Dashboard
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
        Vessel Risk Intelligence
        ===============================================================
        */

        const vesselRisk =

        await vesselRiskEngine
        .generateRiskAssessment();


        /*
        ===============================================================
        Business Intelligence
        ===============================================================
        */

        const businessIntelligence =

        businessIntelligenceEngine
        .generateBusinessIntelligence();


        /*
        ===============================================================
        Safe Enterprise Feed Intelligence
        ===============================================================
        */

        const aisFeed =

        enterpriseFeeds
        .ais || {};


        const freightFeed =

        enterpriseFeeds
        .freight || {};


        const weatherFeed =

        enterpriseFeeds
        .weather || {};


        /*
        ===============================================================
        Market Sentiment
        ===============================================================
        */

        const marketSentiment =

        freightFeed
        .sentiment ||

        'STABLE';


        /*
        ===============================================================
        Weather Risk
        ===============================================================
        */

        const weatherRisk =

        weatherFeed
        .risk ||

        'LOW';


        /*
        ===============================================================
        Overall Platform Status
        ===============================================================
        */

        let overallStatus =

        'GREEN';


        if (

            congestionIntelligence
            .portRisk
            .riskLevel === 'HIGH'

            ||

            vesselRisk
            .voyageRisk
            .overallRisk === 'HIGH'

        ) {

            overallStatus =

            'RED';

        }

        else if (

            congestionIntelligence
            .portRisk
            .riskLevel === 'MEDIUM'

            ||

            vesselRisk
            .voyageRisk
            .overallRisk === 'MEDIUM'

        ) {

            overallStatus =

            'AMBER';

        }


        /*
        ===============================================================
        Executive Dashboard Response
        ===============================================================
        */

        return {

            platform:

            'Enterprise Maritime AI Intelligence Platform',


            overallStatus,


            executiveSummary: {

                activeVessels:

                aisFeed
                .activeVessels || 0,


                marketSentiment,


                weatherRisk,


                congestionRisk:

                congestionIntelligence
                .portRisk
                .riskLevel,


                voyageRisk:

                vesselRisk
                .voyageRisk
                .overallRisk,


                revenueOpportunityCrores:

                businessIntelligence
                .executiveSummary
                .revenueOpportunityCrores,


                additionalCalls:

                businessIntelligence
                .executiveSummary
                .additionalCalls,


                transshipmentPotential:

                businessIntelligence
                .executiveSummary
                .transshipmentPotential,


                highestRiskPort:

                businessIntelligence
                .executiveSummary
                .highestRiskPort

            },


            congestionIntelligence,


            vesselRisk,


            businessIntelligence,


            generatedAt:

            new Date()
            .toISOString()

        };

    }

}


module.exports =

new ExecutiveDashboard();