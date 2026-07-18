/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Port Comparison Engine
Version : 2.0.0
===============================================================
*/

const portOperationalProfileService =
require('../services/portOperationalProfileService');


class PortComparisonEngine {


    /*
    ===========================================================
    Calculate Port Risk
    ===========================================================
    */

    calculatePortRisk({

        delayHours,

        berthOccupancy,

        anchorageQueue

    }) {

        let score = 0;


        if (

            berthOccupancy >= 90

        ) {

            score += 40;

        }

        else if (

            berthOccupancy >= 80

        ) {

            score += 25;

        }

        else if (

            berthOccupancy >= 70

        ) {

            score += 10;

        }


        if (

            delayHours >= 24

        ) {

            score += 35;

        }

        else if (

            delayHours >= 12

        ) {

            score += 20;

        }

        else if (

            delayHours >= 6

        ) {

            score += 10;

        }


        if (

            anchorageQueue >= 15

        ) {

            score += 25;

        }

        else if (

            anchorageQueue >= 8

        ) {

            score += 15;

        }

        else if (

            anchorageQueue >= 4

        ) {

            score += 10;

        }


        let risk =

        'LOW';


        if (

            score >= 70

        ) {

            risk =

            'HIGH';

        }

        else if (

            score >= 40

        ) {

            risk =

            'MEDIUM';

        }


        return {

            risk,

            riskScore:
            score

        };

    }


    /*
    ===========================================================
    Generate Port Comparison
    ===========================================================
    */

    generateComparison() {

        const profiles =

        portOperationalProfileService
        .getAllProfiles();


        const ports =

        profiles
        .map(

            profile => {

                const riskAnalysis =

                this
                .calculatePortRisk({

                    delayHours:

                    profile.delayHours,


                    berthOccupancy:

                    profile.berthOccupancy,


                    anchorageQueue:

                    profile.anchorageQueue

                });


                return {

                    port:

                    profile.port,


                    risk:

                    riskAnalysis.risk,


                    riskScore:

                    riskAnalysis.riskScore,


                    delayHours:

                    profile.delayHours,


                    berthOccupancy:

                    profile.berthOccupancy,


                    anchorageQueue:

                    profile.anchorageQueue,


                    marketPosition:

                    profile.marketPosition,


                    source:

                    profile.source,


                    sourceType:

                    profile.sourceType,


                    profileStatus:

                    profile.status

                };

            }

        );


        return {

            generatedAt:

            new Date()
            .toISOString(),


            ports

        };

    }

}


module.exports =

new PortComparisonEngine();