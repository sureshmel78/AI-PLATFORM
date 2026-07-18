/*
===============================================================
Enterprise Maritime AI Intelligence Platform
API Communication Module
Version : 2.0.0
===============================================================
*/

const api = {

    baseURL: "/api",

    /*
    ===============================================================
    Generic API Request
    ===============================================================
    */

    async request(
        endpoint,
        options = {}
    ) {

        const requestOptions = {

            method:
                options.method ||
                "GET",

            headers: {
                "Content-Type":
                    "application/json",

                ...(
                    typeof Auth !== "undefined"
                        ? Auth.getAuthHeaders()
                        : {}
                ),

                ...(
                    options.headers ||
                    {}
                )
            }

        };

        if (
            options.body !== undefined &&
            options.body !== null
        ) {

            requestOptions.body =

                typeof options.body === "string"

                    ? options.body

                    : JSON.stringify(
                        options.body
                    );

        }

        try {

            const response =
                await fetch(

                    `${this.baseURL}${endpoint}`,

                    requestOptions

                );

            let result = null;

            try {

                result =
                    await response.json();

            }

            catch (error) {

                result = {
                    success: false,
                    message:
                        "Invalid server response."
                };

            }

            if (
                response.status === 401
            ) {

                if (

                    typeof Auth !== "undefined" &&

                    typeof Auth.handleUnauthorized === "function"

                ) {

                    Auth.handleUnauthorized();

                }

                throw new Error(
                    result?.message ||
                    "Unauthorized request."
                );

            }

            if (
                !response.ok
            ) {

                throw new Error(
                    result?.message ||
                    `API request failed with status ${response.status}.`
                );

            }

            return result;

        }

        catch (error) {

            console.error(

                `API Error [${endpoint}]:`,

                error

            );

            return {

                success: false,

                message:
                    error.message ||
                    "API request failed.",

                data: null

            };

        }

    },

    /*
    ===============================================================
    Platform Health
    ===============================================================
    */

    async getHealth() {

        return this.request(
            "/health"
        );

    },

    /*
    ===============================================================
    Public Executive Dashboard
    ===============================================================
    */

    async getDashboard() {

        return this.request(
            "/public/dashboard"
        );

    },

    /*
    ===============================================================
    Vessel Intelligence
    ===============================================================
    */

    async getVessels() {

        return this.request(
            "/ais/vessels"
        );

    },

    /*
    ===============================================================
    Historical Intelligence Logs
    ===============================================================
    */

    async getHistory() {

        return this.request(
            "/intelligence/history"
        );

    },

    /*
    ===============================================================
    Congestion Intelligence
    ===============================================================
    */

    async getCongestionIntelligence() {

        return this.request(
            "/intelligence/congestion"
        );

    },

    /*
    ===============================================================
    Generic GET Request
    ===============================================================
    */

    async get(endpoint) {

        return this.request(
            endpoint,
            {
                method: "GET"
            }
        );

    },

    /*
    ===============================================================
    Generic POST Request
    ===============================================================
    */

    async post(
        endpoint,
        data = {}
    ) {

        return this.request(
            endpoint,
            {
                method: "POST",
                body: data
            }
        );

    },

    /*
    ===============================================================
    Generic PUT Request
    ===============================================================
    */

    async put(
        endpoint,
        data = {}
    ) {

        return this.request(
            endpoint,
            {
                method: "PUT",
                body: data
            }
        );

    },

    /*
    ===============================================================
    Generic DELETE Request
    ===============================================================
    */

    async delete(endpoint) {

        return this.request(
            endpoint,
            {
                method: "DELETE"
            }
        );

    }

};