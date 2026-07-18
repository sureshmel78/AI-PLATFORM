/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Authentication Module
Version : 2.0.1
===============================================================
*/

const Auth = {

    token: null,

    storageKey: "token",

    /*
    ===============================================================
    Initialize Authentication
    ===============================================================
    */

    init() {

        this.token =
            localStorage.getItem(
                this.storageKey
            );

        this.updateInterface();

        Utils.log(
            this.token
                ? "Authentication Session Restored"
                : "Authentication Required"
        );

        return Boolean(
            this.token
        );

    },

    /*
    ===============================================================
    Application Compatibility Initializer
    ===============================================================
    */

    initialize() {

        return this.init();

    },

    /*
    ===============================================================
    Login
    ===============================================================
    */

    async login() {

        const usernameElement =
            document.getElementById(
                "username"
            );

        const passwordElement =
            document.getElementById(
                "password"
            );

        if (
            !usernameElement ||
            !passwordElement
        ) {

            console.error(
                "Authentication input fields not found."
            );

            return false;

        }

        const username =
            usernameElement.value.trim();

        const password =
            passwordElement.value;

        if (
            !username ||
            !password
        ) {

            alert(
                "Please enter username and password."
            );

            return false;

        }

        try {

            const response =
                await fetch(
                    "/api/auth/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                username,
                                password
                            })
                    }
                );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result ||
                result.success === false ||
                !result.token
            ) {

                throw new Error(
                    result?.message ||
                    "Invalid login credentials."
                );

            }

            this.setToken(
                result.token
            );

            passwordElement.value = "";

            this.updateInterface();

            Utils.log(
                "Enterprise Authentication Successful"
            );

            if (

                typeof App !== "undefined" &&

                typeof App.initializeDashboard === "function"

            ) {

                await App.initializeDashboard();

            }

            return true;

        }

        catch (error) {

            console.error(
                "Authentication Error:",
                error
            );

            alert(
                error.message ||
                "Server connection failed."
            );

            return false;

        }

    },

    /*
    ===============================================================
    Logout
    ===============================================================
    */

    logout() {

        this.clearToken();

        this.updateInterface();

        Utils.log(
            "Enterprise Session Closed"
        );

        window.location.reload();

    },

    /*
    ===============================================================
    Set Authentication Token
    ===============================================================
    */

    setToken(token) {

        this.token =
            token
                ? String(token)
                : null;

        if (
            this.token
        ) {

            localStorage.setItem(
                this.storageKey,
                this.token
            );

        }

    },

    /*
    ===============================================================
    Clear Authentication Token
    ===============================================================
    */

    clearToken() {

        this.token = null;

        localStorage.removeItem(
            this.storageKey
        );

    },

    /*
    ===============================================================
    Get Authentication Token
    ===============================================================
    */

    getToken() {

        if (
            !this.token
        ) {

            this.token =
                localStorage.getItem(
                    this.storageKey
                );

        }

        return this.token;

    },

    /*
    ===============================================================
    Authentication Status
    ===============================================================
    */

    isAuthenticated() {

        return Boolean(
            this.getToken()
        );

    },

    /*
    ===============================================================
    Authorization Header
    ===============================================================
    */

    getAuthHeaders() {

        const token =
            this.getToken();

        if (
            !token
        ) {

            return {};

        }

        return {
            Authorization:
                `Bearer ${token}`
        };

    },

    /*
    ===============================================================
    Update Authentication Interface
    ===============================================================
    */

    updateInterface() {

        const authSection =
            document.getElementById(
                "authSection"
            );

        const dashboardSection =
            document.getElementById(
                "dashboardSection"
            );

        const authenticated =
            this.isAuthenticated();

        if (
            authSection
        ) {

            authSection.style.display =
                authenticated
                    ? "none"
                    : "block";

        }

        if (
            dashboardSection
        ) {

            dashboardSection.style.display =
                authenticated
                    ? "block"
                    : "none";

        }

    },

    /*
    ===============================================================
    Handle Unauthorized Response
    ===============================================================
    */

    handleUnauthorized() {

        this.clearToken();

        this.updateInterface();

        Utils.log(
            "Authentication Session Expired"
        );

        alert(
            "Your session has expired. Please login again."
        );

    }

};

/*
===============================================================
Legacy Interface Compatibility
===============================================================
*/

async function login() {

    return Auth.login();

}

function logout() {

    return Auth.logout();

}