/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Port Operational Profile Service
Version : 1.0.0
===============================================================
*/

class PortOperationalProfileService {

    constructor() {

        this.profiles = {

            'VOC PORT': {

                delayHours:
                3,

                berthOccupancy:
                72,

                anchorageQueue:
                2,

                marketPosition:
                'STRONG'

            },

            'CHENNAI': {

                delayHours:
                12,

                berthOccupancy:
                84,

                anchorageQueue:
                8,

                marketPosition:
                'MODERATE'

            },

            'COCHIN': {

                delayHours:
                4,

                berthOccupancy:
                68,

                anchorageQueue:
                3,

                marketPosition:
                'STABLE'

            },

            'COLOMBO': {

                delayHours:
                24,

                berthOccupancy:
                95,

                anchorageQueue:
                15,

                marketPosition:
                'VERY STRONG'

            },

            'VIZHINJAM': {

                delayHours:
                2,

                berthOccupancy:
                61,

                anchorageQueue:
                1,

                marketPosition:
                'EMERGING'

            }

        };

    }


    /*
    ===========================================================
    Normalize Port Name
    ===========================================================
    */

    normalizePortName(portName) {

        return String(
            portName || ''
        )
        .trim()
        .toUpperCase();

    }


    /*
    ===========================================================
    Get Port Profile
    ===========================================================
    */

    getProfile(portName) {

        const normalizedPort =

        this.normalizePortName(
            portName
        );


        const profile =

        this.profiles[
            normalizedPort
        ];


        if (!profile) {

            return {

                port:
                normalizedPort || 'UNKNOWN',

                delayHours:
                null,

                berthOccupancy:
                null,

                anchorageQueue:
                null,

                marketPosition:
                'UNKNOWN',

                source:
                'NO_PORT_PROFILE',

                sourceType:
                'UNAVAILABLE',

                status:
                'PROFILE_NOT_AVAILABLE'

            };

        }


        return {

            port:
            normalizedPort,

            delayHours:
            Number(
                profile.delayHours
            ),

            berthOccupancy:
            Number(
                profile.berthOccupancy
            ),

            anchorageQueue:
            Number(
                profile.anchorageQueue
            ),

            marketPosition:
            profile.marketPosition,

            source:
            'PORT_OPERATIONAL_PROFILE',

            sourceType:
            'BENCHMARK_PROFILE',

            status:
            'PROFILE_AVAILABLE'

        };

    }


    /*
    ===========================================================
    Get All Port Profiles
    ===========================================================
    */

    getAllProfiles() {

        return Object
        .keys(
            this.profiles
        )
        .map(

            portName =>

            this.getProfile(
                portName
            )

        );

    }

}


module.exports =

new PortOperationalProfileService();