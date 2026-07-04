/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Vessel Risk Engine
Version : 2.0.1
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
    Generate Vessel Risk Assessment
    ===========================================================
    */

    async generateRiskAssessment() {

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


        /*
        =======================================================
        Live AIS Vessel
        =======================================================
        */

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


        /*
        =======================================================
        Vessel Intelligence Input
        =======================================================
        */

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


        /*
        =======================================================
        AIS Destination Intelligence
        =======================================================
        */

        const destination =

        this
        .getDestinationCoordinates(

            liveVessel.destination

        );


        /*
        =======================================================
        Weather Intelligence Input
        =======================================================
        */

        const weatherData = {

            windSpeed:
            32,

            waveHeight:
            4.5,

            visibility:
            5

        };


        /*
        =======================================================
        ETA Intelligence
        =======================================================
        */

        const etaAnalysis =

        vesselIntelligence
        .calculateETA(

            vessel,

            destination

        );


        /*
        =======================================================
        Weather Intelligence
        =======================================================
        */

        const weatherAnalysis =

        vesselIntelligence
        .calculateWeatherImpact(

            weatherData

        );


        /*
        =======================================================
        Fuel Intelligence
        =======================================================
        */

        const fuelAnalysis =

        vesselIntelligence
        .calculateFuelRisk(

            vessel

        );


        /*
        =======================================================
        Voyage Risk Intelligence
        =======================================================
        */

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

            'LOW',


            routeDeviation:

            false

        });


        /*
        =======================================================
        Intelligence Logging
        =======================================================
        */

        console.log(

            'WEATHER:',

            weatherAnalysis

        );


        console.log(

            'FUEL:',

            fuelAnalysis

        );


        console.log(

            'VOYAGE:',

            voyageRisk

        );


        /*
        =======================================================
        Vessel Risk Response
        =======================================================
        */

        return {

            vessel:

            vessel.name,


            aisDestination:

            liveVessel.destination
            || 'UNKNOWN',


            aisSpeed:

            vessel.speed,


            etaAnalysis,


            weatherAnalysis,


            fuelAnalysis,


            voyageRisk,


            generatedAt:

            new Date()
            .toISOString()

        };

    }

}


module.exports =

new VesselRiskEngine();