/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Vessel Risk Engine
Version : 2.2.0
===============================================================
*/

const aisProvider =
require('../providers/aisProvider');

const vesselIntelligence =
require('./vesselIntelligence');

const riskEngine =
require('./riskEngine');


class VesselRiskEngine {


    /*
    ===========================================================
    Destination Coordinates
    ===========================================================
    */

    getDestinationCoordinates(destinationName) {

        const destinations = {

            TUTICORIN: {

                name:
                'TUTICORIN',

                lat:
                8.7642,

                lon:
                78.1348

            },


            SINGAPORE: {

                name:
                'SINGAPORE',

                lat:
                1.290270,

                lon:
                103.851959

            },


            COLOMBO: {

                name:
                'COLOMBO',

                lat:
                6.9271,

                lon:
                79.8612

            },


            SHANGHAI: {

                name:
                'SHANGHAI',

                lat:
                31.2304,

                lon:
                121.4737

            },


            'JEBEL ALI': {

                name:
                'JEBEL ALI',

                lat:
                25.0118,

                lon:
                55.0615

            }

        };


        const normalizedDestination =

        String(
            destinationName || ''
        )
        .trim()
        .toUpperCase();


        return (

            destinations[
                normalizedDestination
            ]

            ||

            {

                name:

                normalizedDestination
                || 'UNKNOWN',

                lat:
                0,

                lon:
                0

            }

        );

    }


    /*
    ===========================================================
    Planned Route Intelligence
    ===========================================================
    */

    getPlannedRoute(destinationName) {

        const routes = {

            TUTICORIN: [

                {
                    lat:
                    7.5000,

                    lon:
                    77.9000
                },

                {
                    lat:
                    8.0000,

                    lon:
                    78.0000
                },

                {
                    lat:
                    8.5000,

                    lon:
                    78.1000
                },

                {
                    lat:
                    8.7642,

                    lon:
                    78.1348
                }

            ],


            SINGAPORE: [

                {
                    lat:
                    5.5000,

                    lon:
                    95.0000
                },

                {
                    lat:
                    3.5000,

                    lon:
                    99.0000
                },

                {
                    lat:
                    2.0000,

                    lon:
                    102.0000
                },

                {
                    lat:
                    1.290270,

                    lon:
                    103.851959
                }

            ],


            COLOMBO: [

                {
                    lat:
                    8.0000,

                    lon:
                    78.5000
                },

                {
                    lat:
                    7.5000,

                    lon:
                    79.0000
                },

                {
                    lat:
                    6.9271,

                    lon:
                    79.8612
                }

            ],


            SHANGHAI: [

                {
                    lat:
                    25.0000,

                    lon:
                    120.0000
                },

                {
                    lat:
                    28.0000,

                    lon:
                    121.0000
                },

                {
                    lat:
                    31.2304,

                    lon:
                    121.4737
                }

            ],


            'JEBEL ALI': [

                {
                    lat:
                    22.0000,

                    lon:
                    60.0000
                },

                {
                    lat:
                    24.0000,

                    lon:
                    57.0000
                },

                {
                    lat:
                    25.0118,

                    lon:
                    55.0615
                }

            ]

        };


        const normalizedDestination =

        String(
            destinationName || ''
        )
        .trim()
        .toUpperCase();


        return (

            routes[
                normalizedDestination
            ]

            ||

            []

        );

    }


    /*
    ===========================================================
    Normalize Congestion Risk
    ===========================================================
    */

    normalizeCongestionRisk(congestionRisk) {

        const normalizedRisk =

        String(
            congestionRisk || ''
        )
        .trim()
        .toUpperCase();


        if (

            normalizedRisk === 'HIGH'

            ||

            normalizedRisk === 'MEDIUM'

            ||

            normalizedRisk === 'LOW'

        ) {

            return normalizedRisk;

        }


        return 'LOW';

    }


    /*
    ===========================================================
    Generate Vessel Risk Assessment
    ===========================================================
    */

    async generateRiskAssessment(
        congestionRisk = 'LOW'
    ) {

        const vessels =

        await aisProvider
        .getLiveVessels();


        if (

            !Array.isArray(vessels)

            ||

            vessels.length === 0

        ) {

            throw new Error(

                'No AIS vessel data available'

            );

        }


        const liveVessel =

        vessels[0];


        console.log(

            'LIVE VESSEL:',

            JSON.stringify(

                liveVessel,

                null,

                2

            )

        );


        const vessel = {

            name:

            liveVessel.name
            || 'UNKNOWN',


            currentPosition: {

                lat:

                Number(
                    liveVessel.latitude
                )
                || 0,


                lon:

                Number(
                    liveVessel.longitude
                )
                || 0

            },


            speed:

            Number(
                liveVessel.speed
            )
            || 0,


            fuelRemaining:

            400,


            fuelConsumptionPerDay:

            60

        };


        const destination =

        this
        .getDestinationCoordinates(

            liveVessel.destination

        );


        const plannedRoute =

        this
        .getPlannedRoute(

            liveVessel.destination

        );


        const normalizedCongestionRisk =

        this
        .normalizeCongestionRisk(

            congestionRisk

        );


        const weatherData = {

            windSpeed:
            32,

            waveHeight:
            4.5,

            visibility:
            5

        };


        const etaAnalysis =

        vesselIntelligence
        .calculateETA(

            vessel,

            destination

        );


        const weatherAnalysis =

        vesselIntelligence
        .calculateWeatherImpact(

            weatherData

        );


        const fuelAnalysis =

        vesselIntelligence
        .calculateFuelRisk(

            vessel

        );


        let routeAnalysis = {

            vessel:
            vessel.name,

            deviationDistanceNm:
            0,

            deviated:
            false,

            severity:
            'LOW',

            status:
            'ROUTE_NOT_AVAILABLE'

        };


        if (

            Array.isArray(
                plannedRoute
            )

            &&

            plannedRoute.length > 0

        ) {

            routeAnalysis =

            vesselIntelligence
            .detectRouteDeviation(

                vessel,

                plannedRoute

            );

        }


        const voyageRisk =

        riskEngine
        .calculateVoyageRisk({

            weatherRisk:

            weatherAnalysis
            .riskLevel,


            fuelRisk:

            fuelAnalysis
            .riskLevel,


            congestionRisk:

            normalizedCongestionRisk,


            routeDeviation:

            routeAnalysis
            .deviated === true

        });


        console.log(

            'WEATHER:',

            weatherAnalysis

        );


        console.log(

            'FUEL:',

            fuelAnalysis

        );


        console.log(

            'CONGESTION:',

            normalizedCongestionRisk

        );


        console.log(

            'ROUTE:',

            routeAnalysis

        );


        console.log(

            'VOYAGE:',

            voyageRisk

        );


        return {

            vessel:

            vessel.name,


            aisDestination:

            liveVessel.destination
            || 'UNKNOWN',


            aisSpeed:

            vessel.speed,


            congestionRisk:

            normalizedCongestionRisk,


            etaAnalysis,


            weatherAnalysis,


            fuelAnalysis,


            routeAnalysis,


            voyageRisk,


            generatedAt:

            new Date()
            .toISOString()

        };

    }

}


module.exports =

new VesselRiskEngine();