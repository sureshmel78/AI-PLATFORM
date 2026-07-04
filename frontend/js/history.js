/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Historical Intelligence Module
Version : 2.0.0
===============================================================
*/

const History = {

    records: [],

    lastUpdated: null,

    /*
    ===============================================================
    Load Historical Intelligence
    ===============================================================
    */

    async load() {

        try {

            const result =
                await api.getHistory();

            if (
                !result ||
                result.success === false
            ) {

                throw new Error(

                    result?.message ||

                    "Unable to load historical intelligence."

                );

            }

            const history =
                Array.isArray(result.data)
                    ? result.data
                    : [];

            this.records = history;

            this.lastUpdated =
                new Date();

            this.render(
                history
            );

            Utils.log(

                `Historical Intelligence Loaded: ${history.length} records`

            );

            return history;

        }

        catch (error) {

            console.error(

                "Historical Intelligence Error:",

                error

            );

            this.renderError();

            return [];

        }

    },

    /*
    ===============================================================
    Render Historical Intelligence
    ===============================================================
    */

    render(history) {

        const panel =
            document.getElementById(
                "historyLogs"
            );

        if (!panel) {

            return;

        }

        panel.innerHTML = "";

        if (
            !Array.isArray(history) ||
            history.length === 0
        ) {

            panel.innerHTML = `

                <div class="stream-item">

                    <div class="stream-time">

                        ${Utils.formatDateTime(
                            new Date()
                        )}

                    </div>

                    <strong>

                        SYSTEM

                    </strong>

                    <br><br>

                    No historical intelligence records available.

                </div>

            `;

            return;

        }

        history.forEach(

            item => {

                const historyItem =
                    document.createElement(
                        "div"
                    );

                historyItem.className =
                    "stream-item";

                const severity =
                    this.normalizeSeverity(
                        item.severity
                    );

                historyItem.dataset.severity =
                    severity;

                historyItem.innerHTML = `

                    <div class="stream-time">

                        ${this.escapeHTML(
                            Utils.formatDateTime(
                                item.createdAt
                            )
                        )}

                    </div>


                    <strong>

                        ${this.escapeHTML(
                            Utils.safe(
                                item.category,
                                "INTELLIGENCE"
                            )
                        )}

                    </strong>


                    ${this.renderSeverity(
                        severity
                    )}


                    <br><br>


                    ${this.escapeHTML(
                        Utils.safe(
                            item.message,
                            "No intelligence message available."
                        )
                    )}


                    ${this.renderSource(
                        item.source
                    )}


                    ${this.renderAction(
                        item.action
                    )}

                `;

                panel.appendChild(
                    historyItem
                );

            }

        );

    },

    /*
    ===============================================================
    Render Severity
    ===============================================================
    */

    renderSeverity(severity) {

        if (
            !severity ||
            severity === "UNKNOWN"
        ) {

            return "";

        }

        return `

            <span class="${this.getSeverityClass(
                severity
            )}">

                &nbsp; | &nbsp;

                ${this.escapeHTML(
                    severity
                )}

            </span>

        `;

    },

    /*
    ===============================================================
    Render Intelligence Source
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

            <br><br>

            <small>

                <b>Source :</b>

                ${this.escapeHTML(
                    source
                )}

            </small>

        `;

    },

    /*
    ===============================================================
    Render Intelligence Action
    ===============================================================
    */

    renderAction(action) {

        if (
            action === null ||
            action === undefined ||
            action === ""
        ) {

            return "";

        }

        return `

            <br>

            <small>

                <b>Action :</b>

                ${this.escapeHTML(
                    action
                )}

            </small>

        `;

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
    Severity CSS Class
    ===============================================================
    */

    getSeverityClass(severity) {

        switch (
            severity
        ) {

            case "HIGH":

                return "status-high";

            case "MEDIUM":

                return "status-medium";

            case "LOW":

                return "status-good";

            default:

                return "";

        }

    },

    /*
    ===============================================================
    Add Live Intelligence Record
    ===============================================================
    */

    addLiveRecord(data) {

        if (!data) {

            return;

        }

        const record = {

            createdAt:
                data.timestamp ||
                new Date().toISOString(),

            category:
                data.category ||
                "LIVE_INTELLIGENCE",

            severity:
                data.severity ||
                "UNKNOWN",

            source:
                data.source ||
                "WEBSOCKET",

            action:
                data.action ||
                "",

            message:
                data.message ||
                this.buildLiveMessage(
                    data
                )

        };

        this.records.unshift(
            record
        );

        this.records =
            this.records.slice(
                0,
                20
            );

        this.render(
            this.records
        );

    },

    /*
    ===============================================================
    Build Live Intelligence Message
    ===============================================================
    */

    buildLiveMessage(data) {

        const messages = [];

        if (
            data.marketSentiment !== null &&
            data.marketSentiment !== undefined
        ) {

            messages.push(

                `Market: ${data.marketSentiment}`

            );

        }

        if (
            data.weatherRisk !== null &&
            data.weatherRisk !== undefined
        ) {

            messages.push(

                `Weather: ${data.weatherRisk}`

            );

        }

        if (
            data.operationalEfficiency !== null &&
            data.operationalEfficiency !== undefined
        ) {

            messages.push(

                `Efficiency: ${data.operationalEfficiency}`

            );

        }

        if (
            messages.length === 0
        ) {

            return "Live maritime intelligence received.";

        }

        return messages.join(
            " | "
        );

    },

    /*
    ===============================================================
    Filter Historical Intelligence By Category
    ===============================================================
    */

    getByCategory(category) {

        if (!category) {

            return [];

        }

        const targetCategory =
            String(
                category
            )
            .trim()
            .toUpperCase();

        return this.records.filter(

            item =>

                String(
                    item.category || ""
                )
                .trim()
                .toUpperCase() ===
                targetCategory

        );

    },

    /*
    ===============================================================
    Get High Severity Intelligence
    ===============================================================
    */

    getHighSeverity() {

        return this.records.filter(

            item =>

                this.normalizeSeverity(
                    item.severity
                ) === "HIGH"

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
    Render History Error
    ===============================================================
    */

    renderError() {

        const panel =
            document.getElementById(
                "historyLogs"
            );

        if (!panel) {

            return;

        }

        panel.innerHTML = `

            <div class="stream-item">

                <div class="stream-time">

                    ${Utils.formatDateTime(
                        new Date()
                    )}

                </div>

                <strong>

                    SYSTEM ALERT

                </strong>

                <br><br>

                Historical intelligence is temporarily unavailable.

            </div>

        `;

    }

};