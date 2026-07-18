/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Operational Alerts Module
Version : 2.0.0
===============================================================
*/

const Alerts = {

    alerts: [],

    lastUpdated: null,

    /*
    ===============================================================
    Load Operational Alerts
    ===============================================================
    */

    async load() {

        try {

            const result =
                await api.getDashboard();

            if (
                !result ||
                result.success === false
            ) {

                throw new Error(

                    result?.message ||

                    "Unable to load operational alerts."

                );

            }

            const data =
                result.data || {};

            const alerts =
                this.buildDashboardAlerts(
                    data
                );

            this.alerts = alerts;

            this.lastUpdated =
                new Date();

            this.render(
                alerts
            );

            Utils.log(

                `Operational Alerts Loaded: ${alerts.length} alerts`

            );

            return alerts;

        }

        catch (error) {

            console.error(

                "Operational Alerts Error:",

                error

            );

            this.renderError();

            return [];

        }

    },

    /*
    ===============================================================
    Build Dashboard Alerts
    ===============================================================
    */

    buildDashboardAlerts(data) {

        const alerts = [];

        const executiveSummary =
            data.executiveSummary || {};

        const congestionIntelligence =
            data.congestionIntelligence || {};

        const portRisk =
            congestionIntelligence.portRisk || {};

        const vesselRisk =
            data.vesselRisk || {};

        const voyageRisk =
            vesselRisk.voyageRisk || {};

        alerts.push({

            title:
                "Highest Risk Port",

            message:
                Utils.safe(
                    executiveSummary.highestRiskPort,
                    "NO DATA"
                ),

            severity:
                this.normalizeSeverity(
                    portRisk.riskLevel ||
                    executiveSummary.congestionRisk
                ),

            source:
                "EXECUTIVE_INTELLIGENCE"

        });

        alerts.push({

            title:
                "Congestion Risk",

            message:
                Utils.safe(
                    portRisk.riskLevel ||
                    executiveSummary.congestionRisk,
                    "UNKNOWN"
                ),

            severity:
                this.normalizeSeverity(
                    portRisk.riskLevel ||
                    executiveSummary.congestionRisk
                ),

            source:
                "CONGESTION_ENGINE"

        });

        alerts.push({

            title:
                "Voyage Risk",

            message:
                Utils.safe(
                    voyageRisk.overallRisk ||
                    executiveSummary.voyageRisk,
                    "UNKNOWN"
                ),

            severity:
                this.normalizeSeverity(
                    voyageRisk.overallRisk ||
                    executiveSummary.voyageRisk
                ),

            source:
                "RISK_ENGINE"

        });

        return alerts;

    },

    /*
    ===============================================================
    Render Operational Alerts
    ===============================================================
    */

    render(alerts) {

        const container =
            document.getElementById(
                "operationalAlerts"
            );

        if (!container) {

            return;

        }

        container.innerHTML = "";

        if (
            !Array.isArray(alerts) ||
            alerts.length === 0
        ) {

            container.innerHTML = `

                <div class="alert-card-low">

                    <h3>
                        SYSTEM STATUS
                    </h3>

                    <p>
                        No active operational alerts.
                    </p>

                </div>

            `;

            return;

        }

        alerts.forEach(

            alert => {

                const alertCard =
                    document.createElement(
                        "div"
                    );

                const severity =
                    this.normalizeSeverity(
                        alert.severity
                    );

                alertCard.className =
                    this.getAlertClass(
                        severity
                    );

                alertCard.dataset.severity =
                    severity;

                alertCard.innerHTML = `

                    <h3>

                        ${this.escapeHTML(
                            Utils.safe(
                                alert.title,
                                "MARITIME ALERT"
                            )
                        )}

                    </h3>


                    <p>

                        ${this.escapeHTML(
                            Utils.safe(
                                alert.message,
                                "No alert details available."
                            )
                        )}

                    </p>


                    ${this.renderSource(
                        alert.source
                    )}

                `;

                container.appendChild(
                    alertCard
                );

            }

        );

    },

    /*
    ===============================================================
    Update Live Alerts
    ===============================================================
    */

    updateLive(liveAlerts) {

        if (
            !Array.isArray(liveAlerts)
        ) {

            return;

        }

        const alerts =
            liveAlerts.map(

                alert => {

                    if (
                        typeof alert === "string"
                    ) {

                        return {

                            title:
                                "LIVE ALERT",

                            message:
                                alert,

                            severity:
                                this.detectSeverity(
                                    alert
                                ),

                            source:
                                "LIVE_INTELLIGENCE"

                        };

                    }

                    return {

                        title:
                            alert.title ||
                            alert.category ||
                            "LIVE ALERT",

                        message:
                            alert.message ||
                            alert.description ||
                            "Live maritime alert received.",

                        severity:
                            this.normalizeSeverity(
                                alert.severity ||
                                alert.riskLevel
                            ),

                        source:
                            alert.source ||
                            "LIVE_INTELLIGENCE"

                    };

                }

            );

        this.alerts = alerts;

        this.lastUpdated =
            new Date();

        this.render(
            alerts
        );

    },

    /*
    ===============================================================
    Add Single Live Alert
    ===============================================================
    */

    addLiveAlert(alert) {

        if (!alert) {

            return;

        }

        let normalizedAlert;

        if (
            typeof alert === "string"
        ) {

            normalizedAlert = {

                title:
                    "LIVE ALERT",

                message:
                    alert,

                severity:
                    this.detectSeverity(
                        alert
                    ),

                source:
                    "LIVE_INTELLIGENCE"

            };

        }

        else {

            normalizedAlert = {

                title:
                    alert.title ||
                    alert.category ||
                    "LIVE ALERT",

                message:
                    alert.message ||
                    alert.description ||
                    "Live maritime alert received.",

                severity:
                    this.normalizeSeverity(
                        alert.severity ||
                        alert.riskLevel
                    ),

                source:
                    alert.source ||
                    "LIVE_INTELLIGENCE"

            };

        }

        this.alerts.unshift(
            normalizedAlert
        );

        this.alerts =
            this.alerts.slice(
                0,
                20
            );

        this.lastUpdated =
            new Date();

        this.render(
            this.alerts
        );

    },

    /*
    ===============================================================
    Detect Severity From Alert Message
    ===============================================================
    */

    detectSeverity(message) {

        const value =
            String(
                message || ""
            )
            .trim()
            .toUpperCase();

        if (

            value.includes("CRITICAL") ||

            value.includes("SEVERE") ||

            value.includes("HIGH RISK") ||

            value.includes("EMERGENCY") ||

            value.includes("DANGER")

        ) {

            return "HIGH";

        }

        if (

            value.includes("WARNING") ||

            value.includes("MEDIUM") ||

            value.includes("MODERATE") ||

            value.includes("DELAY") ||

            value.includes("CONGESTION")

        ) {

            return "MEDIUM";

        }

        return "LOW";

    },

    /*
    ===============================================================
    Normalize Severity
    ===============================================================
    */

    normalizeSeverity(severity) {

        const value =
            String(
                severity || "UNKNOWN"
            )
            .trim()
            .toUpperCase();

        if (

            value.includes("HIGH") ||

            value.includes("CRITICAL") ||

            value.includes("SEVERE")

        ) {

            return "HIGH";

        }

        if (

            value.includes("MEDIUM") ||

            value.includes("MODERATE") ||

            value.includes("WARNING")

        ) {

            return "MEDIUM";

        }

        if (

            value.includes("LOW") ||

            value.includes("NORMAL") ||

            value.includes("GOOD")

        ) {

            return "LOW";

        }

        return "UNKNOWN";

    },

    /*
    ===============================================================
    Alert CSS Class
    ===============================================================
    */

    getAlertClass(severity) {

        switch (
            severity
        ) {

            case "HIGH":

                return "alert-card-high";

            case "MEDIUM":

                return "alert-card-medium";

            case "LOW":

                return "alert-card-low";

            default:

                return "alert-card-medium";

        }

    },

    /*
    ===============================================================
    Render Alert Source
    ===============================================================
    */

    renderSource(source) {

        if (
            source === null ||
            source === undefined ||
            source === ""
        ) {

            return "";

        }

        return `

            <small>

                <b>
                    Source :
                </b>

                ${this.escapeHTML(
                    source
                )}

            </small>

        `;

    },

    /*
    ===============================================================
    Get High Severity Alerts
    ===============================================================
    */

    getHighSeverity() {

        return this.alerts.filter(

            alert =>

                this.normalizeSeverity(
                    alert.severity
                ) === "HIGH"

        );

    },

    /*
    ===============================================================
    Get Alerts By Source
    ===============================================================
    */

    getBySource(source) {

        if (!source) {

            return [];

        }

        const targetSource =
            String(
                source
            )
            .trim()
            .toUpperCase();

        return this.alerts.filter(

            alert =>

                String(
                    alert.source || ""
                )
                .trim()
                .toUpperCase() ===
                targetSource

        );

    },

    /*
    ===============================================================
    Escape HTML
    ===============================================================
    */

    escapeHTML(value) {

        return String(
            value ?? ""
        )

            .replaceAll(
                "&",
                "&amp;"
            )

            .replaceAll(
                "<",
                "&lt;"
            )

            .replaceAll(
                ">",
                "&gt;"
            )

            .replaceAll(
                "\"",
                "&quot;"
            )

            .replaceAll(
                "'",
                "&#039;"
            );

    },

    /*
    ===============================================================
    Render Alerts Error
    ===============================================================
    */

    renderError() {

        const container =
            document.getElementById(
                "operationalAlerts"
            );

        if (!container) {

            return;

        }

        container.innerHTML = `

            <div class="alert-card-medium">

                <h3>
                    INTELLIGENCE STATUS
                </h3>

                <p>
                    Operational alert intelligence is temporarily unavailable.
                </p>

            </div>

        `;

    }

};