/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Enterprise Server
Version : 10.1.1
===============================================================
*/

require('dotenv').config();

const congestionEngine =
require('./engine/congestionEngine');

const executiveDashboard =
require('./engine/executiveDashboard');

const publicDashboard =
require('./engine/publicDashboard');

const vesselIntelligence =
require('./engine/vesselIntelligence');

const aisCacheService =
require('./services/aisCacheService');

const express =
require('express');

const cors =
require('cors');

const http =
require('http');

const path =
require('path');

const mongoose =
require('mongoose');

const bcrypt =
require('bcrypt');

const {
    Server
} =
require('socket.io');

const authMiddleware =
require('./middleware/authMiddleware');

const websocketEngine =
require('./engine/websocketEngine');

const aisProvider =
require('./providers/aisProvider');

const IntelligenceLog =
require('./models/intelligenceLog');


const app =
express();


const server =
http.createServer(
    app
);


const io =
new Server(
    server,
    {
        cors: {
            origin:
            '*'
        }
    }
);


app.use(
    cors()
);


app.use(
    express.json()
);


/*
===============================================================
FRONTEND
===============================================================
*/

app.use(

    express.static(

        path.join(

            __dirname,

            'frontend'

        )

    )

);


const PORT =

process.env.PORT || 5000;


/*
===============================================================
MONGODB
===============================================================
*/

mongoose
.connect(

    process.env.MONGO_URI

)
.then(

    () => {

        console.log(

            'MongoDB Connected'

        );

    }

)
.catch(

    error => {

        console.log(

            'MongoDB Error:',

            error.message

        );

    }

);


websocketEngine
.initialize(
    io
);


/*
===============================================================
AIS DESTINATION COORDINATES
===============================================================
*/

const AIS_DESTINATIONS = {

    TUTICORIN: {

        name:
        'TUTICORIN',

        lat:
        8.7642,

        lon:
        78.1348

    },


    SINGAPORE: {

        name:
        'SINGAPORE',

        lat:
        1.290270,

        lon:
        103.851959

    },


    COLOMBO: {

        name:
        'COLOMBO',

        lat:
        6.9271,

        lon:
        79.8612

    },


    SHANGHAI: {

        name:
        'SHANGHAI',

        lat:
        31.2304,

        lon:
        121.4737

    },


    'JEBEL ALI': {

        name:
        'JEBEL ALI',

        lat:
        25.0118,

        lon:
        55.0615

    }

};


/*
===============================================================
AIS ETA ENRICHMENT
===============================================================
*/

function enrichVesselETA(
    vessel
) {

    const destinationName =

    String(

        vessel.destination || ''

    )
    .trim()
    .toUpperCase();


    const navigationStatus =

    String(

        vessel.navigationStatus || ''

    )
    .trim()
    .toUpperCase();


    const movingStatuses = [

        'UNDER WAY USING ENGINE',

        'UNDER WAY SAILING'

    ];


    const isUnderWay =

    movingStatuses.includes(
        navigationStatus
    );


    const destination =

    AIS_DESTINATIONS[
        destinationName
    ];


    const speed =

    Number(
        vessel.speed
    );


    const latitude =

    Number(
        vessel.latitude
    );


    const longitude =

    Number(
        vessel.longitude
    );


    if (

        !isUnderWay

        ||

        !destination

        ||

        !Number.isFinite(
            speed
        )

        ||

        speed <= 0

        ||

        !Number.isFinite(
            latitude
        )

        ||

        !Number.isFinite(
            longitude
        )

    ) {

        return {

            ...vessel,

            eta:
            null

        };

    }


    const etaAnalysis =

    vesselIntelligence
    .calculateETA(

        {

            name:

            vessel.name
            || 'UNKNOWN',


            currentPosition: {

                lat:
                latitude,

                lon:
                longitude

            },


            speed

        },

        destination

    );


    if (

        !etaAnalysis

        ||

        etaAnalysis.error

        ||

        !etaAnalysis.eta

    ) {

        return {

            ...vessel,

            eta:
            null

        };

    }


    return {

        ...vessel,

        eta:

        etaAnalysis.eta

    };

}


/*
===============================================================
ROOT
===============================================================
*/

app.get(

    '/',

    (
        req,
        res
    ) => {

        res.sendFile(

            path.join(

                __dirname,

                'frontend',

                'index.html'

            )

        );

    }

);


/*
===============================================================
HEALTH
===============================================================
*/

app.get(

    '/api/health',

    async (
        req,
        res
    ) => {

        const mongoStatus =

        mongoose.connection.readyState === 1

        ? 'CONNECTED'

        : 'DISCONNECTED';


        return res.json({

            success:
            true,

            system:
            'ACTIVE',

            database:
            mongoStatus,

            websocket:
            'ACTIVE',

            timestamp:

            new Date()
            .toISOString(),

            version:
            '10.1.1'

        });

    }

);


/*
===============================================================
LOGIN
===============================================================
*/

app.post(

    '/api/auth/login',

    async (
        req,
        res,
        next
    ) => {

        try {

            const {

                username,

                password

            } =
            req.body;


            if (

                username !==
                process.env.ADMIN_USER

            ) {

                throw new Error(

                    'Invalid username'

                );

            }


            const validPassword =

            await bcrypt.compare(

                password,

                process.env.ADMIN_PASSWORD_HASH

            );


            if (
                !validPassword
            ) {

                throw new Error(

                    'Invalid password'

                );

            }


            const token =

            authMiddleware
            .generateToken({

                username,

                role:
                'ADMIN'

            });


            return res.json({

                success:
                true,

                token

            });

        }

        catch (
            error
        ) {

            next(
                error
            );

        }

    }

);


/*
===============================================================
AIS VESSEL INTELLIGENCE
===============================================================
*/

app.get(

    '/api/ais/vessels',

    authMiddleware.verifyToken,

    async (
        req,
        res,
        next
    ) => {

        try {

            const vessels =

            await aisProvider
            .getLiveVessels();


            const enrichedVessels =

            Array.isArray(
                vessels
            )

            ? vessels.map(

                vessel =>

                enrichVesselETA(
                    vessel
                )

            )

            : [];


            return res.json({

                success:
                true,

                data:
                enrichedVessels

            });

        }

        catch (
            error
        ) {

            next(
                error
            );

        }

    }

);


/*
===============================================================
INTELLIGENCE HISTORY
===============================================================
*/

app.get(

    '/api/intelligence/history',

    authMiddleware.verifyToken,

    async (
        req,
        res,
        next
    ) => {

        try {

            const history =

            await IntelligenceLog
            .find()
            .sort({

                createdAt:
                -1

            })
            .limit(
                20
            );


            return res.json({

                success:
                true,

                data:
                history

            });

        }

        catch (
            error
        ) {

            next(
                error
            );

        }

    }

);


/*
===============================================================
CONGESTION INTELLIGENCE
===============================================================
*/

app.get(

    '/api/intelligence/congestion',

    authMiddleware.verifyToken,

    async (
        req,
        res,
        next
    ) => {

        try {

            const intelligence =

            await congestionEngine
            .generateCongestionIntelligence();


            await IntelligenceLog
            .create({

                category:
                'PORT_CONGESTION',

                severity:

                intelligence
                .portRisk
                .riskLevel,

                source:
                'AI_ENGINE',

                message:

                `${intelligence.port} congestion forecast: ${intelligence.congestionForecast.congestionLevel}`,

                action:
                'CONGESTION_ANALYSIS',

                metadata:
                intelligence

            });


            return res.json({

                success:
                true,

                data:
                intelligence

            });

        }

        catch (
            error
        ) {

            next(
                error
            );

        }

    }

);


/*
===============================================================
EXECUTIVE DASHBOARD
===============================================================
*/

app.get(

    '/api/intelligence/dashboard',

    authMiddleware.verifyToken,

    async (
        req,
        res,
        next
    ) => {

        try {

            const dashboard =

            await executiveDashboard
            .generateDashboard();


            await IntelligenceLog
            .create({

                category:
                'EXECUTIVE_DASHBOARD',

                severity:
                dashboard.overallStatus,

                source:
                'AI_ENGINE',

                message:

                `Executive dashboard generated with status ${dashboard.overallStatus}`,

                action:
                'DASHBOARD_ANALYSIS',

                metadata:
                dashboard

            });


            return res.json({

                success:
                true,

                data:
                dashboard

            });

        }

        catch (
            error
        ) {

            next(
                error
            );

        }

    }

);


/*
===============================================================
PUBLIC DASHBOARD
===============================================================
*/

app.get(

    '/api/public/dashboard',

    async (
        req,
        res,
        next
    ) => {

        try {

            const dashboard =

            await publicDashboard
            .getDashboard();


            return res.json({

                success:
                true,

                data:
                dashboard

            });

        }

        catch (
            error
        ) {

            next(
                error
            );

        }

    }

);


/*
===============================================================
ERROR HANDLER
===============================================================
*/

app.use(

    (
        error,
        req,
        res,
        next
    ) => {

        console.log(

            error.message

        );


        return res
        .status(
            500
        )
        .json({

            success:
            false,

            message:
            error.message

        });

    }

);


/*
===============================================================
SERVER
===============================================================
*/

aisCacheService
.start();

aisStreamService
.start();


server.listen(

    PORT,

    () => {

        console.log(`

====================================================
Enterprise Maritime AI Intelligence Platform
====================================================

Status      : ACTIVE
Port        : ${PORT}
Environment : development
MongoDB     : ENABLED
WebSocket   : ENABLED
Frontend    : ENABLED

====================================================

`);

    }

);