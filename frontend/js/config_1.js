/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Frontend Configuration Module
Version : 2.0.0
===============================================================
*/

const Config = {

    /*
    ===============================================================
    Platform Identity
    ===============================================================
    */

    platform: {

        name:
            "Enterprise Maritime AI Intelligence Platform",

        shortName:
            "Maritime AI",

        version:
            "2.0.0",

        environment:
            "development"

    },

    /*
    ===============================================================
    API Configuration
    ===============================================================
    */

    api: {

        baseURL:
            "/api",

        timeout:
            30000

    },

    /*
    ===============================================================
    WebSocket Configuration
    ===============================================================
    */

    websocket: {

        enabled:
            true,

        reconnect:
            true,

        reconnectDelay:
            3000,

        maxReconnectAttempts:
            10

    },

    /*
    ===============================================================
    Maritime Map Configuration
    ===============================================================
    */

    map: {

        defaultCenter: [
            20,
            78
        ],

        defaultZoom:
            3,

        vesselFocusZoom:
            8,

        maxZoom:
            19,

        tileURL:
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        attribution:
            "&copy; OpenStreetMap contributors"

    },

    /*
    ===============================================================
    Fleet Intelligence Configuration
    ===============================================================
    */

    fleet: {

        movingSpeedThreshold:
            0.5,

        mediumRiskSpeed:
            14,

        highRiskSpeed:
            25,

        autoRefresh:
            true,

        refreshInterval:
            60000

    },

    /*
    ===============================================================
    Intelligence History Configuration
    ===============================================================
    */

    history: {

        maximumRecords:
            20,

        autoRefresh:
            true,

        refreshInterval:
            60000

    },

    /*
    ===============================================================
    Alert Configuration
    ===============================================================
    */

    alerts: {

        enabled:
            true,

        maximumAlerts:
            50,

        highSeverity:
            "HIGH",

        mediumSeverity:
            "MEDIUM",

        lowSeverity:
            "LOW"

    },

    /*
    ===============================================================
    Dashboard Configuration
    ===============================================================
    */

    dashboard: {

        autoRefresh:
            true,

        refreshInterval:
            60000

    },

    /*
    ===============================================================
    Authentication Configuration
    ===============================================================
    */

    authentication: {

        tokenStorageKey:
            "token"

    },

    /*
    ===============================================================
    Logging Configuration
    ===============================================================
    */

    logging: {

        enabled:
            true,

        debug:
            true

    },

    /*
    ===============================================================
    Get Nested Configuration Value
    ===============================================================
    */

    get(
        section,
        key,
        fallback = null
    ) {

        if (
            !section ||
            !key
        ) {

            return fallback;

        }

        const configurationSection =
            this[
                section
            ];

        if (
            !configurationSection ||
            configurationSection[
                key
            ] === undefined
        ) {

            return fallback;

        }

        return configurationSection[
            key
        ];

    }

};