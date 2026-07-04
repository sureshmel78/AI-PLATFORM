/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Main Application Controller
Version : 2.0.1
===============================================================
*/

const App = {

    initialized: false,

    initializing: false,

    refreshTimers: [],

    /*
    ===============================================================
    Application Initialization
    ===============================================================
    */

    async initialize() {

        if (
            this.initialized ||
            this.initializing
        ) {

            Utils.log(
                "Application already initialized"
            );

            return true;

        }

        if (
            typeof Auth === "undefined" ||
            !Auth.isAuthenticated()
        ) {

            Utils.log(
                "Application waiting for authentication"
            );

            return false;

        }

        this.initializing = true;

        Utils.log(
            `${Config.platform.name} V${Config.platform.version}`
        );

        try {

            await this.loadCoreModules();

            this.initializeRealtime();

            this.startAutoRefresh();

            this.initialized = true;

            Utils.log(
                "Application Initialization Complete"
            );

            return true;

        }

        catch (error) {

            console.error(
                "Application Initialization Error:",
                error
            );

            this.showSystemError(
                "Platform initialization failed."
            );

            return false;

        }

        finally {

            this.initializing = false;

        }

    },

    /*
    ===============================================================
    Dashboard Compatibility Initializer
    ===============================================================
    */

    async initializeDashboard() {

        return this.initialize();

    },

    /*
    ===============================================================
    Load Core Modules
    ===============================================================
    */

    async loadCoreModules() {

        const tasks = [];

        if (

            typeof Dashboard !== "undefined" &&

            typeof Dashboard.load === "function"

        ) {

            tasks.push(

                this.safeModuleLoad(

                    "Dashboard",

                    () => Dashboard.load()

                )

            );

        }

        if (

            typeof Fleet !== "undefined" &&

            typeof Fleet.load === "function"

        ) {

            tasks.push(

                this.safeModuleLoad(

                    "Fleet",

                    () => Fleet.load()

                )

            );

        }

        if (

            typeof Alerts !== "undefined" &&

            typeof Alerts.load === "function"

        ) {

            tasks.push(

                this.safeModuleLoad(

                    "Alerts",

                    () => Alerts.load()

                )

            );

        }

        if (

            typeof History !== "undefined" &&

            typeof History.load === "function"

        ) {

            tasks.push(

                this.safeModuleLoad(

                    "History",

                    () => History.load()

                )

            );

        }

        await Promise.allSettled(
            tasks
        );

        if (

            typeof MaritimeMap !== "undefined" &&

            typeof MaritimeMap.init === "function"

        ) {

            await this.safeModuleLoad(

                "Maritime Map",

                () => MaritimeMap.init()

            );

        }

        if (

            typeof MaritimeMap !== "undefined" &&

            typeof MaritimeMap.fitFleet === "function"

        ) {

            MaritimeMap.fitFleet();

        }

    },

    /*
    ===============================================================
    Safe Independent Module Loader
    ===============================================================
    */

    async safeModuleLoad(
        moduleName,
        loader
    ) {

        try {

            await loader();

            Utils.log(
                `${moduleName} Loaded`
            );

            return true;

        }

        catch (error) {

            console.error(

                `${moduleName} Module Error:`,

                error

            );

            return false;

        }

    },

    /*
    ===============================================================
    Realtime Initialization
    ===============================================================
    */

    initializeRealtime() {

        if (
            !Config.websocket.enabled
        ) {

            Utils.log(
                "WebSocket Disabled"
            );

            return;

        }

        if (

            typeof WebSocketManager !== "undefined" &&

            typeof WebSocketManager.initialize === "function"

        ) {

            try {

                WebSocketManager.initialize();

                Utils.log(
                    "WebSocket Manager Initialized"
                );

            }

            catch (error) {

                console.error(

                    "WebSocket Initialization Error:",

                    error

                );

            }

        }

    },

    /*
    ===============================================================
    Auto Refresh Manager
    ===============================================================
    */

    startAutoRefresh() {

        this.stopAutoRefresh();

        if (
            Config.dashboard.autoRefresh
        ) {

            this.registerRefreshTimer(

                async () => {

                    if (
                        !Auth.isAuthenticated()
                    ) {

                        return;

                    }

                    if (

                        typeof Dashboard !== "undefined" &&

                        typeof Dashboard.load === "function"

                    ) {

                        await this.safeModuleLoad(

                            "Dashboard Refresh",

                            () => Dashboard.load()

                        );

                    }

                },

                Config.dashboard.refreshInterval

            );

        }

        if (
            Config.fleet.autoRefresh
        ) {

            this.registerRefreshTimer(

                async () => {

                    if (
                        !Auth.isAuthenticated()
                    ) {

                        return;

                    }

                    if (

                        typeof Fleet !== "undefined" &&

                        typeof Fleet.load === "function"

                    ) {

                        await this.safeModuleLoad(

                            "Fleet Refresh",

                            () => Fleet.load()

                        );

                    }

                },

                Config.fleet.refreshInterval

            );

        }

        if (
            Config.history.autoRefresh
        ) {

            this.registerRefreshTimer(

                async () => {

                    if (
                        !Auth.isAuthenticated()
                    ) {

                        return;

                    }

                    if (

                        typeof History !== "undefined" &&

                        typeof History.load === "function"

                    ) {

                        await this.safeModuleLoad(

                            "History Refresh",

                            () => History.load()

                        );

                    }

                },

                Config.history.refreshInterval

            );

        }

        if (
            Config.alerts.enabled
        ) {

            this.registerRefreshTimer(

                async () => {

                    if (
                        !Auth.isAuthenticated()
                    ) {

                        return;

                    }

                    if (

                        typeof Alerts !== "undefined" &&

                        typeof Alerts.load === "function"

                    ) {

                        await this.safeModuleLoad(

                            "Alerts Refresh",

                            () => Alerts.load()

                        );

                    }

                },

                Config.dashboard.refreshInterval

            );

        }

        Utils.log(
            "Auto Refresh Started"
        );

    },

    /*
    ===============================================================
    Register Refresh Timer
    ===============================================================
    */

    registerRefreshTimer(
        callback,
        interval
    ) {

        const refreshInterval =
            Number(
                interval
            );

        if (

            !Number.isFinite(
                refreshInterval
            ) ||

            refreshInterval <= 0

        ) {

            return;

        }

        const timer =
            setInterval(

                callback,

                refreshInterval

            );

        this.refreshTimers.push(
            timer
        );

    },

    /*
    ===============================================================
    Stop Auto Refresh
    ===============================================================
    */

    stopAutoRefresh() {

        this.refreshTimers.forEach(

            timer => {

                clearInterval(
                    timer
                );

            }

        );

        this.refreshTimers = [];

    },

    /*
    ===============================================================
    Manual Full Refresh
    ===============================================================
    */

    async refresh() {

        if (
            !Auth.isAuthenticated()
        ) {

            return false;

        }

        Utils.log(
            "Manual Platform Refresh Started"
        );

        await this.loadCoreModules();

        Utils.log(
            "Manual Platform Refresh Complete"
        );

        return true;

    },

    /*
    ===============================================================
    System Error Display
    ===============================================================
    */

    showSystemError(message) {

        console.error(
            message
        );

        const dashboard =
            document.getElementById(
                "dashboardData"
            );

        if (
            dashboard
        ) {

            dashboard.innerHTML = `

                <div class="card">

                    <h3>
                        Platform Alert
                    </h3>

                    <h2>
                        SYSTEM ERROR
                    </h2>

                    <p>
                        ${Utils.safe(message)}
                    </p>

                </div>

            `;

        }

    },

    /*
    ===============================================================
    Application Shutdown
    ===============================================================
    */

    shutdown() {

        this.stopAutoRefresh();

        if (

            typeof WebSocketManager !== "undefined" &&

            typeof WebSocketManager.disconnect === "function"

        ) {

            WebSocketManager.disconnect();

        }

        this.initialized = false;

        this.initializing = false;

        Utils.log(
            "Application Shutdown Complete"
        );

    }

};


/*
===============================================================
Browser Startup
===============================================================
*/

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        try {

            const authenticated =
                Auth.initialize();

            if (
                authenticated
            ) {

                await App.initialize();

            }

        }

        catch (error) {

            console.error(
                "Startup Error:",
                error
            );

            App.showSystemError(
                "Platform startup failed."
            );

        }

    }

);


/*
===============================================================
Browser Shutdown
===============================================================
*/

window.addEventListener(

    "beforeunload",

    () => {

        App.shutdown();

    }

);