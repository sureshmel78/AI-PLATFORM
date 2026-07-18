/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Maritime World Map Module
Version : 2.0.0
===============================================================
*/

const MaritimeMap = {

    map: null,

    vesselMarkers: {},

    vessels: [],

    initialized: false,

    defaultCenter: [
        20,
        78
    ],

    defaultZoom: 3,

    /*
    ===============================================================
    Initialize Maritime World Map
    ===============================================================
    */

    init() {

        try {

            const mapContainer =
                document.getElementById(
                    "worldMap"
                );

            if (!mapContainer) {

                console.warn(
                    "World map container not found."
                );

                return false;

            }

            if (
                typeof L === "undefined"
            ) {

                console.error(
                    "Leaflet library is not available."
                );

                return false;

            }

            if (this.map) {

                this.map.invalidateSize();

                return true;

            }

            this.map =
                L.map(
                    "worldMap",
                    {
                        zoomControl: true,
                        worldCopyJump: true
                    }
                ).setView(
                    this.defaultCenter,
                    this.defaultZoom
                );

            L.tileLayer(

                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

                {
                    maxZoom: 19,

                    attribution:
                        "&copy; OpenStreetMap contributors"
                }

            ).addTo(
                this.map
            );

            this.initialized = true;

            setTimeout(

                () => {

                    if (this.map) {

                        this.map.invalidateSize();

                    }

                },

                250

            );

            Utils.log(
                "Maritime World Map Initialized"
            );

            return true;

        }

        catch (error) {

            console.error(
                "Maritime Map Initialization Error:",
                error
            );

            this.initialized = false;

            return false;

        }

    },

    /*
    ===============================================================
    Update Vessel Intelligence On Map
    ===============================================================
    */

    updateVessels(vessels) {

        try {

            if (!this.map) {

                const initialized =
                    this.init();

                if (!initialized) {

                    return;

                }

            }

            const fleet =
                Array.isArray(vessels)
                    ? vessels
                    : [];

            this.vessels = fleet;

            const activeMMSI =
                new Set();

            fleet.forEach(

                vessel => {

                    const latitude =
                        this.getLatitude(
                            vessel
                        );

                    const longitude =
                        this.getLongitude(
                            vessel
                        );

                    if (

                        latitude === null ||

                        longitude === null

                    ) {

                        return;

                    }

                    const markerId =
                        this.getMarkerId(
                            vessel
                        );

                    activeMMSI.add(
                        markerId
                    );

                    if (
                        this.vesselMarkers[
                            markerId
                        ]
                    ) {

                        this.updateMarker(

                            this.vesselMarkers[
                                markerId
                            ],

                            vessel,

                            latitude,

                            longitude

                        );

                    }

                    else {

                        this.createMarker(

                            markerId,

                            vessel,

                            latitude,

                            longitude

                        );

                    }

                }

            );

            this.removeInactiveMarkers(
                activeMMSI
            );

            Utils.log(

                `Maritime Map Updated: ${activeMMSI.size} vessel markers`

            );

        }

        catch (error) {

            console.error(
                "Maritime Map Vessel Update Error:",
                error
            );

        }

    },

    /*
    ===============================================================
    Create Vessel Marker
    ===============================================================
    */

    createMarker(
        markerId,
        vessel,
        latitude,
        longitude
    ) {

        const marker =
            L.marker(
                [
                    latitude,
                    longitude
                ]
            );

        marker.bindPopup(
            this.buildPopup(
                vessel
            )
        );

        marker.addTo(
            this.map
        );

        marker.vesselData =
            vessel;

        this.vesselMarkers[
            markerId
        ] = marker;

    },

    /*
    ===============================================================
    Update Existing Vessel Marker
    ===============================================================
    */

    updateMarker(
        marker,
        vessel,
        latitude,
        longitude
    ) {

        marker.setLatLng(
            [
                latitude,
                longitude
            ]
        );

        marker.setPopupContent(
            this.buildPopup(
                vessel
            )
        );

        marker.vesselData =
            vessel;

    },

    /*
    ===============================================================
    Build Vessel Intelligence Popup
    ===============================================================
    */

    buildPopup(vessel) {

        const name =
            Utils.safe(
                vessel.name,
                "Unknown Vessel"
            );

        const vesselType =
            Utils.safe(
                vessel.vesselType,
                "-"
            );

        const mmsi =
            Utils.safe(
                vessel.mmsi,
                "-"
            );

        const speed =
            Utils.formatSpeed(
                vessel.speed
            );

        const destination =
            Utils.safe(
                vessel.destination,
                "-"
            );

        const status =
            Utils.safe(
                vessel.navigationStatus,
                "-"
            );

        return `

            <div class="vessel-map-popup">

                <strong>
                    ${name}
                </strong>

                <br>

                Type:
                ${vesselType}

                <br>

                MMSI:
                ${mmsi}

                <br>

                Speed:
                ${speed}

                <br>

                Destination:
                ${destination}

                <br>

                Status:
                ${status}

            </div>

        `;

    },

    /*
    ===============================================================
    Focus Selected Vessel
    ===============================================================
    */

    focusVessel(vessel) {

        if (
            !vessel
        ) {

            return;

        }

        if (!this.map) {

            const initialized =
                this.init();

            if (!initialized) {

                return;

            }

        }

        const latitude =
            this.getLatitude(
                vessel
            );

        const longitude =
            this.getLongitude(
                vessel
            );

        if (

            latitude === null ||

            longitude === null

        ) {

            Utils.log(
                "Selected vessel has no valid position.",
                vessel
            );

            return;

        }

        const markerId =
            this.getMarkerId(
                vessel
            );

        this.map.setView(

            [
                latitude,
                longitude
            ],

            8

        );

        const marker =
            this.vesselMarkers[
                markerId
            ];

        if (marker) {

            marker.openPopup();

        }

    },

    /*
    ===============================================================
    Remove Inactive Vessel Markers
    ===============================================================
    */

    removeInactiveMarkers(
        activeMMSI
    ) {

        Object.keys(
            this.vesselMarkers
        ).forEach(

            markerId => {

                if (
                    activeMMSI.has(
                        markerId
                    )
                ) {

                    return;

                }

                const marker =
                    this.vesselMarkers[
                        markerId
                    ];

                if (

                    marker &&

                    this.map

                ) {

                    this.map.removeLayer(
                        marker
                    );

                }

                delete this.vesselMarkers[
                    markerId
                ];

            }

        );

    },

    /*
    ===============================================================
    Extract Vessel Latitude
    ===============================================================
    */

    getLatitude(vessel) {

        const value =

            vessel.latitude ??

            vessel.lat ??

            vessel.position?.latitude ??

            vessel.position?.lat;

        const latitude =
            Number(
                value
            );

        if (

            !Number.isFinite(
                latitude
            ) ||

            latitude < -90 ||

            latitude > 90

        ) {

            return null;

        }

        return latitude;

    },

    /*
    ===============================================================
    Extract Vessel Longitude
    ===============================================================
    */

    getLongitude(vessel) {

        const value =

            vessel.longitude ??

            vessel.lng ??

            vessel.lon ??

            vessel.position?.longitude ??

            vessel.position?.lng ??

            vessel.position?.lon;

        const longitude =
            Number(
                value
            );

        if (

            !Number.isFinite(
                longitude
            ) ||

            longitude < -180 ||

            longitude > 180

        ) {

            return null;

        }

        return longitude;

    },

    /*
    ===============================================================
    Generate Vessel Marker Identifier
    ===============================================================
    */

    getMarkerId(vessel) {

        if (
            vessel.mmsi
        ) {

            return String(
                vessel.mmsi
            );

        }

        if (
            vessel.imo
        ) {

            return `IMO-${vessel.imo}`;

        }

        return [

            Utils.safe(
                vessel.name,
                "VESSEL"
            ),

            this.getLatitude(
                vessel
            ),

            this.getLongitude(
                vessel
            )

        ].join(
            "-"
        );

    },

    /*
    ===============================================================
    Fit Map To Active Fleet
    ===============================================================
    */

    fitFleet() {

        if (
            !this.map
        ) {

            return;

        }

        const markers =
            Object.values(
                this.vesselMarkers
            );

        if (
            markers.length === 0
        ) {

            this.map.setView(
                this.defaultCenter,
                this.defaultZoom
            );

            return;

        }

        const bounds =
            L.featureGroup(
                markers
            ).getBounds();

        if (
            bounds.isValid()
        ) {

            this.map.fitBounds(

                bounds,

                {
                    padding: [
                        40,
                        40
                    ],
                    maxZoom: 8
                }

            );

        }

    },

    /*
    ===============================================================
    Clear Maritime Map
    ===============================================================
    */

    clear() {

        Object.values(
            this.vesselMarkers
        ).forEach(

            marker => {

                if (

                    marker &&

                    this.map

                ) {

                    this.map.removeLayer(
                        marker
                    );

                }

            }

        );

        this.vesselMarkers = {};

        this.vessels = [];

    },

    /*
    ===============================================================
    Refresh Map Dimensions
    ===============================================================
    */

    refresh() {

        if (
            this.map
        ) {

            this.map.invalidateSize();

        }

    }

};