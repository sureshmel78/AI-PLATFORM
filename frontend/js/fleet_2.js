/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Fleet Intelligence Module
Version : 2.0.0
===============================================================
*/

const Fleet = {

    vessels: [],

    lastUpdated: null,

    /*
    ===============================================================
    Load Fleet Intelligence
    ===============================================================
    */

    async load() {

        try {

            const result =
                await api.getVessels();

            if (
                !result ||
                result.success === false
            ) {

                throw new Error(

                    result?.message ||

                    "Unable to load vessel intelligence."

                );

            }

            const vessels =
                Array.isArray(result.data)
                    ? result.data
                    : [];

            this.vessels = vessels;

            this.lastUpdated =
                new Date();

            this.renderTable(
                vessels
            );

            this.updateFleetMetrics(
                vessels
            );

            this.notifyMap(
                vessels
            );

            Utils.log(

                `Fleet Intelligence Loaded: ${vessels.length} vessels`

            );

            return vessels;

        }

        catch (error) {

            console.error(

                "Fleet Intelligence Error:",

                error

            );

            this.renderError();

            return [];

        }

    },

    /*
    ===============================================================
    Render Fleet Intelligence Table
    ===============================================================
    */

    renderTable(vessels) {

        const tableBody =
            document.getElementById(
                "fleetTableBody"
            );

        if (!tableBody) {

            return;

        }

        tableBody.innerHTML = "";

        if (
            !Array.isArray(vessels) ||
            vessels.length === 0
        ) {

            tableBody.innerHTML = `

                <tr>

                    <td colspan="7">

                        No vessel intelligence available

                    </td>

                </tr>

            `;

            return;

        }

        vessels.forEach(

            vessel => {

                const row =
                    document.createElement(
                        "tr"
                    );

                const risk =
                    this.calculateOperationalRisk(
                        vessel
                    );

                const riskClass =
                    this.getRiskClass(
                        risk
                    );

                row.innerHTML = `

                    <td>

                        ${Utils.safe(
                            vessel.name
                        )}

                    </td>


                    <td>

                        ${Utils.safe(
                            vessel.vesselType
                        )}

                    </td>


                    <td>

                        ${Utils.formatSpeed(
                            vessel.speed
                        )}

                    </td>


                    <td>

                        ${Utils.safe(
                            vessel.destination
                        )}

                    </td>


                    <td>

                        ${this.formatETA(
                            vessel.eta
                        )}

                    </td>


                    <td>

                        ${Utils.safe(
                            vessel.provider
                        )}

                    </td>


                    <td class="${riskClass}">

                        ${Utils.safe(
                            vessel.navigationStatus,
                            risk
                        )}

                    </td>

                `;

                row.dataset.mmsi =
                    Utils.safe(
                        vessel.mmsi,
                        ""
                    );

                row.addEventListener(

                    "click",

                    () => {

                        this.selectVessel(
                            vessel
                        );

                    }

                );

                tableBody.appendChild(
                    row
                );

            }

        );

    },

    /*
    ===============================================================
    Calculate Basic Operational Risk
    ===============================================================
    */

    calculateOperationalRisk(vessel) {

        const speed =
            Number(
                vessel.speed || 0
            );

        if (
            speed > 25
        ) {

            return "HIGH";

        }

        if (
            speed > 14
        ) {

            return "MEDIUM";

        }

        return "LOW";

    },

    /*
    ===============================================================
    Risk CSS Class
    ===============================================================
    */

    getRiskClass(risk) {

        switch (
            String(risk).toUpperCase()
        ) {

            case "HIGH":

                return "status-high";

            case "MEDIUM":

                return "status-medium";

            default:

                return "status-good";

        }

    },

    /*
    ===============================================================
    ETA Formatter
    ===============================================================
    */

    formatETA(eta) {

        if (!eta) {

            return "-";

        }

        try {

            if (
                typeof eta === "object"
            ) {

                if (eta.date) {

                    return Utils.formatDateTime(
                        eta.date
                    );

                }

                if (eta.timestamp) {

                    return Utils.formatDateTime(
                        eta.timestamp
                    );

                }

                return JSON.stringify(
                    eta
                );

            }

            const parsedDate =
                new Date(eta);

            if (
                Number.isNaN(
                    parsedDate.getTime()
                )
            ) {

                return Utils.safe(
                    eta
                );

            }

            return Utils.formatDateTime(
                eta
            );

        }

        catch (error) {

            return Utils.safe(
                eta
            );

        }

    },

    /*
    ===============================================================
    Fleet Metrics
    ===============================================================
    */

    updateFleetMetrics(vessels) {

        const fleet =
            Array.isArray(vessels)
                ? vessels
                : [];

        const moving =
            fleet.filter(

                vessel =>

                    Number(
                        vessel.speed || 0
                    ) > 0.5

            ).length;

        const anchored =
            fleet.length - moving;

        const highRisk =
            fleet.filter(

                vessel =>

                    this.calculateOperationalRisk(
                        vessel
                    ) === "HIGH"

            ).length;

        this.updateMetric(

            "liveVesselCount",

            fleet.length

        );

        this.updateMetric(

            "movingVessels",

            moving

        );

        this.updateMetric(

            "anchoredVessels",

            anchored

        );

        this.updateMetric(

            "highRiskVessels",

            highRisk

        );

    },

    /*
    ===============================================================
    Update Individual Metric
    ===============================================================
    */

    updateMetric(
        elementId,
        value
    ) {

        const element =
            document.getElementById(
                elementId
            );

        if (!element) {

            return;

        }

        element.textContent =
            Utils.formatNumber(
                value
            );

    },

    /*
    ===============================================================
    Notify Maritime Map
    ===============================================================
    */

    notifyMap(vessels) {

        if (

            typeof MaritimeMap !== "undefined" &&

            typeof MaritimeMap.updateVessels === "function"

        ) {

            MaritimeMap.updateVessels(
                vessels
            );

        }

    },

    /*
    ===============================================================
    Vessel Selection
    ===============================================================
    */

    selectVessel(vessel) {

        if (!vessel) {

            return;

        }

        Utils.log(

            "Vessel Selected",

            vessel

        );

        if (

            typeof MaritimeMap !== "undefined" &&

            typeof MaritimeMap.focusVessel === "function"

        ) {

            MaritimeMap.focusVessel(
                vessel
            );

        }

    },

    /*
    ===============================================================
    Find Vessel By MMSI
    ===============================================================
    */

    findByMMSI(mmsi) {

        return this.vessels.find(

            vessel =>

                String(vessel.mmsi) ===
                String(mmsi)

        ) || null;

    },

    /*
    ===============================================================
    Get Moving Vessels
    ===============================================================
    */

    getMovingVessels() {

        return this.vessels.filter(

            vessel =>

                Number(
                    vessel.speed || 0
                ) > 0.5

        );

    },

    /*
    ===============================================================
    Get High Risk Vessels
    ===============================================================
    */

    getHighRiskVessels() {

        return this.vessels.filter(

            vessel =>

                this.calculateOperationalRisk(
                    vessel
                ) === "HIGH"

        );

    },

    /*
    ===============================================================
    Render Fleet Error
    ===============================================================
    */

    renderError() {

        const tableBody =
            document.getElementById(
                "fleetTableBody"
            );

        if (!tableBody) {

            return;

        }

        tableBody.innerHTML = `

            <tr>

                <td colspan="7">

                    Vessel intelligence temporarily unavailable

                </td>

            </tr>

        `;

        this.updateFleetMetrics(
            []
        );

    }

};