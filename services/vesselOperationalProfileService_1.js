/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Vessel Operational Profile Service
Version : 1.0.0
===============================================================
*/

class VesselOperationalProfileService {


    constructor() {

        this.profiles = {

            IMO9876543: {

                fuelRemaining:
                400,

                fuelConsumptionPerDay:
                60,

                source:
                'VESSEL_OPERATIONAL_PROFILE',

                sourceType:
                'MANUAL_PROFILE',

                updatedAt:
                null

            },


            IMO9765432: {

                fuelRemaining:
                850,

                fuelConsumptionPerDay:
                75,

                source:
                'VESSEL_OPERATIONAL_PROFILE',

                sourceType:
                'MANUAL_PROFILE',

                updatedAt:
                null

            },


            IMO9654321: {

                fuelRemaining:
                520,

                fuelConsumptionPerDay:
                38,

                source:
                'VESSEL_OPERATIONAL_PROFILE',

                sourceType:
                'MANUAL_PROFILE',

                updatedAt:
                null

            },


            IMO9543210: {

                fuelRemaining:
                1100,

                fuelConsumptionPerDay:
                55,

                source:
                'VESSEL_OPERATIONAL_PROFILE',

                sourceType:
                'MANUAL_PROFILE',

                updatedAt:
                null

            },


            IMO9432109: {

                fuelRemaining:
                700,

                fuelConsumptionPerDay:
                70,

                source:
                'VESSEL_OPERATIONAL_PROFILE',

                sourceType:
                'MANUAL_PROFILE',

                updatedAt:
                null

            }

        };

    }


    /*
    ===========================================================
    Normalize IMO
    ===========================================================
    */

    normalizeIMO(imo) {

        return String(
            imo || ''
        )
        .trim()
        .toUpperCase();

    }


    /*
    ===========================================================
    Get Vessel Operational Profile
    ===========================================================
    */

    getProfile(imo) {

        const normalizedIMO =

        this.normalizeIMO(
            imo
        );


        const profile =

        this.profiles[
            normalizedIMO
        ];


        if (!profile) {

            return {

                imo:
                normalizedIMO || 'UNKNOWN',

                fuelRemaining:
                null,

                fuelConsumptionPerDay:
                null,

                source:
                'NO_OPERATIONAL_PROFILE',

                sourceType:
                'UNAVAILABLE',

                updatedAt:
                null,

                status:
                'PROFILE_NOT_AVAILABLE'

            };

        }


        return {

            imo:
            normalizedIMO,

            fuelRemaining:
            Number(
                profile.fuelRemaining
            ),

            fuelConsumptionPerDay:
            Number(
                profile.fuelConsumptionPerDay
            ),

            source:
            profile.source,

            sourceType:
            profile.sourceType,

            updatedAt:
            profile.updatedAt,

            status:
            'PROFILE_AVAILABLE'

        };

    }


    /*
    ===========================================================
    Update Vessel Operational Profile
    ===========================================================
    */

    updateProfile(
        imo,
        {
            fuelRemaining,
            fuelConsumptionPerDay,
            sourceType = 'MANUAL_PROFILE'
        }
    ) {

        const normalizedIMO =

        this.normalizeIMO(
            imo
        );


        if (!normalizedIMO) {

            throw new Error(
                'IMO number required'
            );

        }


        const remainingFuel =

        Number(
            fuelRemaining
        );


        const dailyConsumption =

        Number(
            fuelConsumptionPerDay
        );


        if (

            !Number.isFinite(
                remainingFuel
            )

            ||

            remainingFuel < 0

        ) {

            throw new Error(
                'Invalid fuel remaining value'
            );

        }


        if (

            !Number.isFinite(
                dailyConsumption
            )

            ||

            dailyConsumption <= 0

        ) {

            throw new Error(
                'Invalid fuel consumption value'
            );

        }


        const updatedAt =

        new Date()
        .toISOString();


        this.profiles[
            normalizedIMO
        ] = {

            fuelRemaining:
            remainingFuel,

            fuelConsumptionPerDay:
            dailyConsumption,

            source:
            'VESSEL_OPERATIONAL_PROFILE',

            sourceType,

            updatedAt

        };


        return this.getProfile(
            normalizedIMO
        );

    }

}


module.exports =

new VesselOperationalProfileService();