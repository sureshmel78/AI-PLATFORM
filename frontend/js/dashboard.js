/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Dashboard Intelligence Module
Version : 2.0.1
===============================================================
*/

const Dashboard = {

    healthData: null,

    intelligenceData: null,

    /*
    ===============================================================
    Load Dashboard
    ===============================================================
    */

    async load() {

        try {

            const results =
                await Promise.allSettled([

                    this.loadHealth(),

                    this.loadIntelligence()

                ]);

            if (
                results[0].status === "rejected"
            ) {

                console.error(

                    "Dashboard Health Error:",

                    results[0].reason

                );

            }

            if (
                results[1].status === "rejected"
            ) {

                console.error(

                    "Dashboard Intelligence Error:",

                    results[1].reason

                );

            }

            Utils.log(
                "Dashboard Load Complete"
            );

        }

        catch (error) {

            console.error(

                "Dashboard Load Error:",

                error

            );

            this.renderDashboardError();

        }

    },

    /*
    ===============================================================
    Platform Health
    ===============================================================
    */

    async loadHealth() {

        const result =
            await api.getHealth();

        if (
            !result ||
            result.success === false
        ) {

            throw new Error(

                result?.message ||

                "Unable to load platform health."

            );

        }

        this.healthData =
            result;

        this.renderHealth(
            result
        );

        return result;

    },

    /*
    ===============================================================
    Dashboard Intelligence
    ===============================================================
    */

    async loadIntelligence() {

        const result =
            await api.getDashboard();

        if (
            !result ||
            result.success === false
        ) {

            throw new Error(

                result?.message ||

                "Unable to load dashboard intelligence."

            );

        }

        const data =
            result.data || {};

        this.intelligenceData =
            data;

        this.renderExecutiveMetrics(
            data
        );

        this.renderExecutiveSummary(
            data
        );

        return data;

    },

    /*
    ===============================================================
    Render Platform Health
    ===============================================================
    */

    renderHealth(data) {

        const container =
            document.getElementById(
                "dashboardData"
            );

        if (!container) {

            return;

        }

        const system =
            Utils.safe(
                data.system,
                "UNKNOWN"
            );

        const database =
            Utils.safe(
                data.database,
                "UNKNOWN"
            );

        const websocket =
            Utils.safe(
                data.websocket,
                "UNKNOWN"
            );

        const version =
            Utils.safe(
                data.version,
                Config.platform.version
            );

        container.innerHTML = `

            <div class="card">

                <h3>
                    Platform
                </h3>

                <h2>
                    ${system}
                </h2>

            </div>

            <div class="card">

                <h3>
                    Database
                </h3>

                <h2>
                    ${database}
                </h2>

            </div>

            <div class="card">

                <h3>
                    WebSocket
                </h3>

                <h2>
                    ${websocket}
                </h2>

            </div>

            <div class="card">

                <h3>
                    Version
                </h3>

                <h2>
                    ${version}
                </h2>

            </div>

        `;

    },

    /*
    ===============================================================
    Render Executive Metrics
    ===============================================================
    */

    renderExecutiveMetrics(data) {

        const container =
            document.getElementById(
                "enterpriseMetrics"
            );

        if (!container) {

            return;

        }

        const summary =
            data.executiveSummary || {};

        const activeVessels =
            Utils.safe(
                summary.activeVessels,
                0
            );

        const marketSentiment =
            Utils.safe(
                summary.marketSentiment,
                "UNKNOWN"
            );

        const weatherRisk =
            Utils.safe(
                summary.weatherRisk,
                "UNKNOWN"
            );

        const congestionRisk =
            Utils.safe(
                summary.congestionRisk,
                "UNKNOWN"
            );

        const voyageRisk =
            Utils.safe(
                summary.voyageRisk,
                "UNKNOWN"
            );

        const revenueOpportunity =
            Utils.safe(
                summary.revenueOpportunityCrores,
                0
            );

        const additionalCalls =
            Utils.safe(
                summary.additionalCalls,
                0
            );

        const transshipmentPotential =
            Utils.safe(
                summary.transshipmentPotential,
                "UNKNOWN"
            );

        container.innerHTML = `

            <div class="card">

                <h3>
                    🚢 Active Vessels
                </h3>

                <h2>
                    ${activeVessels}
                </h2>

            </div>

            <div class="card">

                <h3>
                    📈 Market
                </h3>

                <h2>
                    ${marketSentiment}
                </h2>

            </div>

            <div class="card">

                <h3>
                    🌦 Weather
                </h3>

                <h2>
                    ${weatherRisk}
                </h2>

            </div>

            <div class="card">

                <h3>
                    ⚓ Congestion
                </h3>

                <h2>
                    ${congestionRisk}
                </h2>

            </div>

            <div class="card">

                <h3>
                    ⚠ Voyage Risk
                </h3>

                <h2>
                    ${voyageRisk}
                </h2>

            </div>

            <div class="card">

                <h3>
                    💰 Revenue Opportunity
                </h3>

                <h2>
                    ₹ ${revenueOpportunity} Cr
                </h2>

            </div>

            <div class="card">

                <h3>
                    🚢 Additional Calls
                </h3>

                <h2>
                    ${additionalCalls}
                </h2>

            </div>

            <div class="card">

                <h3>
                    🎯 Transshipment
                </h3>

                <h2>
                    ${transshipmentPotential}
                </h2>

            </div>

        `;

    },

    /*
    ===============================================================
    Render Executive Summary
    ===============================================================
    */

    renderExecutiveSummary(data) {

        const container =
            document.getElementById(
                "executiveSummary"
            );

        if (!container) {

            return;

        }

        const summary =
            data.executiveSummary || {};

        const overallStatus =
            Utils.safe(
                data.overallStatus,
                "UNKNOWN"
            );

        const revenueOpportunity =
            Utils.safe(
                summary.revenueOpportunityCrores,
                0
            );

        const additionalCalls =
            Utils.safe(
                summary.additionalCalls,
                0
            );

        const transshipmentPotential =
            Utils.safe(
                summary.transshipmentPotential,
                "UNKNOWN"
            );

        const highestRiskPort =
            Utils.safe(
                summary.highestRiskPort,
                "NO DATA"
            );

        container.innerHTML = `

            <div class="card">

                <h3>
                    Executive Overview
                </h3>

                <p>

                    <b>
                        Overall Status :
                    </b>

                    ${overallStatus}

                    <br><br>

                    <b>
                        Revenue Opportunity :
                    </b>

                    ₹ ${revenueOpportunity} Cr

                    <br><br>

                    <b>
                        Additional Vessel Calls :
                    </b>

                    ${additionalCalls}

                    <br><br>

                    <b>
                        Transshipment Potential :
                    </b>

                    ${transshipmentPotential}

                    <br><br>

                    <b>
                        Highest Risk Port :
                    </b>

                    ${highestRiskPort}

                </p>

            </div>

        `;

    },

    /*
    ===============================================================
    Live Dashboard Update
    ===============================================================
    */

    updateLive(data) {

        if (!data) {

            return;

        }

        const container =
            document.getElementById(
                "dashboardData"
            );

        if (!container) {

            return;

        }

        const marketSentiment =
            Utils.safe(
                data.marketSentiment,
                "UNKNOWN"
            );

        const weatherRisk =
            Utils.safe(
                data.weatherRisk,
                "UNKNOWN"
            );

        const operationalEfficiency =
            Utils.safe(
                data.operationalEfficiency,
                "UNKNOWN"
            );

        container.innerHTML = `

            <div class="card">

                <h3>
                    Platform Status
                </h3>

                <h2>
                    LIVE
                </h2>

            </div>

            <div class="card">

                <h3>
                    Market Sentiment
                </h3>

                <h2>
                    ${marketSentiment}
                </h2>

            </div>

            <div class="card">

                <h3>
                    Weather Risk
                </h3>

                <h2>
                    ${weatherRisk}
                </h2>

            </div>

            <div class="card">

                <h3>
                    Operational Efficiency
                </h3>

                <h2>
                    ${operationalEfficiency}
                </h2>

            </div>

        `;

    },

    /*
    ===============================================================
    Dashboard Error
    ===============================================================
    */

    renderDashboardError() {

        const container =
            document.getElementById(
                "dashboardData"
            );

        if (!container) {

            return;

        }

        container.innerHTML = `

            <div class="card">

                <h3>
                    Platform Status
                </h3>

                <h2>
                    DATA UNAVAILABLE
                </h2>

                <p>
                    Dashboard intelligence could not be loaded.
                </p>

            </div>

        `;

    }

};