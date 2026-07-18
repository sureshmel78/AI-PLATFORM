/*
===============================================================
Enterprise Maritime AI Intelligence Platform
WebSocket Intelligence Module
Version : 2.0.1
===============================================================
*/

const WebSocketManager = {

    socket: null,

    initialized: false,

    connected: false,

    reconnectAttempts: 0,

    maxStreamItems: 50,

    /*
    ===============================================================
    Initialize WebSocket Intelligence
    ===============================================================
    */

    initialize() {

        if (
            this.initialized
        ) {

            return true;

        }

        if (
            !Config.websocket.enabled
        ) {

            Utils.log(
                "WebSocket Disabled"
            );

            return false;

        }

        if (
            typeof io === "undefined"
        ) {

            console.error(
                "Socket.IO client library is not available."
            );

            this.renderSystemMessage(

                "WebSocket client unavailable.",

                "SYSTEM ALERT"

            );

            return false;

        }

        try {

            this.socket =
                io({

                    transports: [
                        "websocket",
                        "polling"
                    ],

                    reconnection:
                        Config.websocket.reconnect,

                    reconnectionAttempts:
                        Config.websocket.maxReconnectAttempts,

                    reconnectionDelay:
                        Config.websocket.reconnectDelay

                });

            this.registerCoreEvents();

            this.registerIntelligenceEvents();

            this.initialized = true;

            Utils.log(
                "WebSocket Initialization Complete"
            );

            return true;

        }

        catch (error) {

            console.error(

                "WebSocket Initialization Error:",

                error

            );

            this.renderSystemMessage(

                "Unable to initialize live maritime intelligence stream.",

                "SYSTEM ALERT"

            );

            return false;

        }

    },

    /*
    ===============================================================
    Register Core Socket Events
    ===============================================================
    */

    registerCoreEvents() {

        if (
            !this.socket
        ) {

            return;

        }

        this.socket.on(

            "connect",

            () => {

                this.connected = true;

                this.reconnectAttempts = 0;

                Utils.log(
                    "Connected to Maritime AI Stream"
                );

                this.renderSystemMessage(

                    "Live maritime intelligence stream connected.",

                    "SYSTEM"

                );

            }

        );

        this.socket.on(

            "disconnect",

            reason => {

                this.connected = false;

                console.warn(

                    "Maritime AI Stream Disconnected:",

                    reason

                );

                this.renderSystemMessage(

                    `Live intelligence stream disconnected: ${reason}`,

                    "SYSTEM ALERT"

                );

            }

        );

        this.socket.on(

            "connect_error",

            error => {

                this.connected = false;

                this.reconnectAttempts += 1;

                console.error(

                    "WebSocket Connection Error:",

                    error

                );

                if (
                    this.reconnectAttempts === 1
                ) {

                    this.renderSystemMessage(

                        "Live intelligence connection temporarily unavailable.",

                        "SYSTEM ALERT"

                    );

                }

            }

        );

        if (
            this.socket.io
        ) {

            this.socket.io.on(

                "reconnect_attempt",

                attempt => {

                    this.reconnectAttempts =
                        attempt;

                    Utils.log(

                        `WebSocket Reconnection Attempt: ${attempt}`

                    );

                }

            );

            this.socket.io.on(

                "reconnect",

                attempt => {

                    this.connected = true;

                    this.reconnectAttempts = 0;

                    Utils.log(

                        `WebSocket Reconnected After ${attempt} Attempts`

                    );

                    this.renderSystemMessage(

                        "Live maritime intelligence stream reconnected.",

                        "SYSTEM"

                    );

                }

            );

            this.socket.io.on(

                "reconnect_failed",

                () => {

                    this.connected = false;

                    console.error(
                        "WebSocket Reconnection Failed"
                    );

                    this.renderSystemMessage(

                        "Live intelligence reconnection failed.",

                        "SYSTEM ALERT"

                    );

                }

            );

        }

    },

    /*
    ===============================================================
    Register Maritime Intelligence Events
    ===============================================================
    */

    registerIntelligenceEvents() {

        if (
            !this.socket
        ) {

            return;

        }

        this.socket.on(

            "live-intelligence",

            data => {

                this.handleLiveIntelligence(
                    data
                );

            }

        );

    },

    /*
    ===============================================================
    Handle Live Maritime Intelligence
    ===============================================================
    */

    handleLiveIntelligence(data) {

        if (

            !data ||

            typeof data !== "object"

        ) {

            console.warn(

                "Invalid Live Intelligence Payload:",

                data

            );

            return;

        }

        Utils.log(

            "Live Maritime Intelligence Received",

            data

        );

        this.renderLiveIntelligence(
            data
        );

        if (

            typeof Dashboard !== "undefined" &&

            typeof Dashboard.updateLive === "function"

        ) {

            Dashboard.updateLive(
                data
            );

        }

        if (
            typeof Alerts !== "undefined"
        ) {

            if (

                Array.isArray(
                    data.alerts
                ) &&

                typeof Alerts.updateLive === "function"

            ) {

                Alerts.updateLive(
                    data.alerts
                );

            }

            else if (

                data.alert &&

                typeof Alerts.addLiveAlert === "function"

            ) {

                Alerts.addLiveAlert(
                    data.alert
                );

            }

        }

        if (

            typeof History !== "undefined" &&

            typeof History.addLiveRecord === "function"

        ) {

            History.addLiveRecord(
                data
            );

        }

        if (
            Array.isArray(
                data.vessels
            )
        ) {

            if (

                typeof Fleet !== "undefined" &&

                typeof Fleet.renderTable === "function"

            ) {

                Fleet.vessels =
                    data.vessels;

                Fleet.lastUpdated =
                    new Date();

                Fleet.renderTable(
                    data.vessels
                );

                if (
                    typeof Fleet.updateFleetMetrics === "function"
                ) {

                    Fleet.updateFleetMetrics(
                        data.vessels
                    );

                }

            }

            if (

                typeof MaritimeMap !== "undefined" &&

                typeof MaritimeMap.updateVessels === "function"

            ) {

                MaritimeMap.updateVessels(
                    data.vessels
                );

            }

        }

    },

    /*
    ===============================================================
    Render Live Intelligence Stream
    ===============================================================
    */

    renderLiveIntelligence(data) {

        const panel =
            document.getElementById(
                "liveStreamPanel"
            );

        if (
            !panel
        ) {

            return;

        }

        const streamItem =
            document.createElement(
                "div"
            );

        streamItem.className =
            "stream-item";

        const timestamp =
            data.timestamp ||
            new Date().toISOString();

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

        streamItem.innerHTML = `

            <div class="stream-time">

                ${Utils.escapeHTML(
                    Utils.formatDateTime(
                        timestamp
                    )
                )}

            </div>

            <b>
                Market :
            </b>

            ${Utils.escapeHTML(
                marketSentiment
            )}

            <br>

            <b>
                Weather :
            </b>

            ${Utils.escapeHTML(
                weatherRisk
            )}

            <br>

            <b>
                Efficiency :
            </b>

            ${Utils.escapeHTML(
                operationalEfficiency
            )}

        `;

        panel.prepend(
            streamItem
        );

        this.trimStream(
            panel
        );

    },

    /*
    ===============================================================
    Render WebSocket System Message
    ===============================================================
    */

    renderSystemMessage(
        message,
        category = "SYSTEM"
    ) {

        const panel =
            document.getElementById(
                "liveStreamPanel"
            );

        if (
            !panel
        ) {

            return;

        }

        const streamItem =
            document.createElement(
                "div"
            );

        streamItem.className =
            "stream-item";

        streamItem.innerHTML = `

            <div class="stream-time">

                ${Utils.escapeHTML(
                    Utils.formatDateTime(
                        new Date()
                    )
                )}

            </div>

            <strong>

                ${Utils.escapeHTML(
                    category
                )}

            </strong>

            <br><br>

            ${Utils.escapeHTML(
                message
            )}

        `;

        panel.prepend(
            streamItem
        );

        this.trimStream(
            panel
        );

    },

    /*
    ===============================================================
    Limit Live Stream Records
    ===============================================================
    */

    trimStream(panel) {

        if (
            !panel
        ) {

            return;

        }

        const items =
            panel.querySelectorAll(
                ".stream-item"
            );

        if (
            items.length <=
            this.maxStreamItems
        ) {

            return;

        }

        for (

            let index =
                this.maxStreamItems;

            index < items.length;

            index += 1

        ) {

            items[
                index
            ].remove();

        }

    },

    /*
    ===============================================================
    Connection Status
    ===============================================================
    */

    isConnected() {

        return Boolean(

            this.socket &&

            this.socket.connected &&

            this.connected

        );

    },

    /*
    ===============================================================
    Manual Socket Reconnection
    ===============================================================
    */

    reconnect() {

        if (
            !this.socket
        ) {

            this.initialized = false;

            this.initialize();

            return;

        }

        if (
            this.socket.connected
        ) {

            return;

        }

        this.socket.connect();

    },

    /*
    ===============================================================
    Disconnect WebSocket
    ===============================================================
    */

    disconnect() {

        if (
            this.socket
        ) {

            this.socket.removeAllListeners();

            this.socket.disconnect();

        }

        this.socket = null;

        this.initialized = false;

        this.connected = false;

        this.reconnectAttempts = 0;

        Utils.log(
            "WebSocket Disconnected"
        );

    }

};