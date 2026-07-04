/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Frontend Utility Module
Version : 2.0.0
===============================================================
*/

const Utils = {

    /*
    ===============================================================
    Safe Display Value
    ===============================================================
    */

    safe(
        value,
        fallback = "-"
    ) {

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {

            return fallback;

        }

        return String(
            value
        );

    },

    /*
    ===============================================================
    Format Number
    ===============================================================
    */

    formatNumber(
        value,
        fallback = "0"
    ) {

        const number =
            Number(
                value
            );

        if (
            !Number.isFinite(
                number
            )
        ) {

            return fallback;

        }

        return new Intl.NumberFormat(
            "en-IN"
        ).format(
            number
        );

    },

    /*
    ===============================================================
    Format Decimal Number
    ===============================================================
    */

    formatDecimal(
        value,
        decimals = 2,
        fallback = "-"
    ) {

        const number =
            Number(
                value
            );

        if (
            !Number.isFinite(
                number
            )
        ) {

            return fallback;

        }

        return number.toFixed(
            decimals
        );

    },

    /*
    ===============================================================
    Format Vessel Speed
    ===============================================================
    */

    formatSpeed(
        value
    ) {

        const speed =
            Number(
                value
            );

        if (
            !Number.isFinite(
                speed
            )
        ) {

            return "-";

        }

        return `${speed.toFixed(1)} kn`;

    },

    /*
    ===============================================================
    Format Percentage
    ===============================================================
    */

    formatPercentage(
        value,
        decimals = 1
    ) {

        const percentage =
            Number(
                value
            );

        if (
            !Number.isFinite(
                percentage
            )
        ) {

            return "-";

        }

        return `${percentage.toFixed(
            decimals
        )}%`;

    },

    /*
    ===============================================================
    Format Currency
    ===============================================================
    */

    formatCurrency(
        value,
        currency = "INR"
    ) {

        const amount =
            Number(
                value
            );

        if (
            !Number.isFinite(
                amount
            )
        ) {

            return "-";

        }

        try {

            return new Intl.NumberFormat(
                "en-IN",
                {
                    style:
                        "currency",

                    currency,

                    maximumFractionDigits:
                        2
                }
            ).format(
                amount
            );

        }

        catch (error) {

            return amount.toFixed(
                2
            );

        }

    },

    /*
    ===============================================================
    Format Date And Time
    ===============================================================
    */

    formatDateTime(
        value
    ) {

        if (
            !value
        ) {

            return "-";

        }

        const date =
            new Date(
                value
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return this.safe(
                value
            );

        }

        return date.toLocaleString(
            "en-IN"
        );

    },

    /*
    ===============================================================
    Format Date
    ===============================================================
    */

    formatDate(
        value
    ) {

        if (
            !value
        ) {

            return "-";

        }

        const date =
            new Date(
                value
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return this.safe(
                value
            );

        }

        return date.toLocaleDateString(
            "en-IN"
        );

    },

    /*
    ===============================================================
    Format Time
    ===============================================================
    */

    formatTime(
        value
    ) {

        if (
            !value
        ) {

            return "-";

        }

        const date =
            new Date(
                value
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return this.safe(
                value
            );

        }

        return date.toLocaleTimeString(
            "en-IN"
        );

    },

    /*
    ===============================================================
    Convert Value To Number
    ===============================================================
    */

    toNumber(
        value,
        fallback = 0
    ) {

        const number =
            Number(
                value
            );

        if (
            !Number.isFinite(
                number
            )
        ) {

            return fallback;

        }

        return number;

    },

    /*
    ===============================================================
    Clamp Numeric Value
    ===============================================================
    */

    clamp(
        value,
        minimum,
        maximum
    ) {

        const number =
            this.toNumber(
                value,
                minimum
            );

        return Math.min(

            Math.max(
                number,
                minimum
            ),

            maximum

        );

    },

    /*
    ===============================================================
    Normalize Text
    ===============================================================
    */

    normalizeText(
        value
    ) {

        return this.safe(
            value,
            ""
        )
            .trim()
            .toUpperCase();

    },

    /*
    ===============================================================
    Escape HTML
    ===============================================================
    */

    escapeHTML(
        value
    ) {

        const text =
            this.safe(
                value,
                ""
            );

        return text

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    },

    /*
    ===============================================================
    Generate Identifier
    ===============================================================
    */

    generateId(
        prefix = "ID"
    ) {

        const timestamp =
            Date.now();

        const random =
            Math.random()
                .toString(36)
                .substring(
                    2,
                    8
                )
                .toUpperCase();

        return `${prefix}-${timestamp}-${random}`;

    },

    /*
    ===============================================================
    Delay Utility
    ===============================================================
    */

    delay(
        milliseconds
    ) {

        return new Promise(

            resolve => {

                setTimeout(
                    resolve,
                    milliseconds
                );

            }

        );

    },

    /*
    ===============================================================
    Application Logger
    ===============================================================
    */

    log(
        message,
        data = null
    ) {

        if (

            typeof Config !== "undefined" &&

            Config.logging &&

            Config.logging.enabled === false

        ) {

            return;

        }

        const timestamp =
            new Date()
                .toISOString();

        if (
            data !== null &&
            data !== undefined
        ) {

            console.log(

                `[Maritime AI] [${timestamp}] ${message}`,

                data

            );

            return;

        }

        console.log(

            `[Maritime AI] [${timestamp}] ${message}`

        );

    },

    /*
    ===============================================================
    Application Error Logger
    ===============================================================
    */

    error(
        message,
        error = null
    ) {

        const timestamp =
            new Date()
                .toISOString();

        if (
            error
        ) {

            console.error(

                `[Maritime AI] [${timestamp}] ${message}`,

                error

            );

            return;

        }

        console.error(

            `[Maritime AI] [${timestamp}] ${message}`

        );

    }

};