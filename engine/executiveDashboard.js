/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Executive Dashboard Engine
Version : 2.1.0
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
        Congestion Risk Intelligence
        ===============================================================
        */

        const congestionRisk =

        congestionIntelligence

        &&

        congestionIntelligence.portRisk

        &&

        congestionIntelligence.portRisk.riskLevel

        ? congestionIntelligence.portRisk.riskLevel

        : 'LOW';


        /*
        ===============================================================
        Vessel Risk Intelligence
        ===============================================================
        */

        const vesselRisk =

        await vesselRiskEngine
        .generateRiskAssessment(

            congestionRisk

        );


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

            congestionRisk === 'HIGH'

            ||

            vesselRisk
            .voyageRisk
            .overallRisk === 'HIGH'

        ) {

            overallStatus =

            'RED';

        }

        else if (

            congestionRisk === 'MEDIUM'

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


                congestionRisk,


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