/*
===============================================================
Enterprise Maritime AI Intelligence Platform
JWT Authentication Middleware
Version : 2.0.0
===============================================================
*/

const jwt =
require("jsonwebtoken");


class AuthMiddleware {

    /*
    ===============================================================
    JWT Secret
    ===============================================================
    */

    getSecret() {

        const secret =
        process.env.JWT_SECRET;


        if (!secret) {

            throw new Error(
                "JWT_SECRET is not configured."
            );

        }


        return secret;

    }


    /*
    ===============================================================
    Generate Authentication Token
    ===============================================================
    */

    generateToken(payload) {

        if (
            !payload ||
            typeof payload !== "object"
        ) {

            throw new Error(
                "Invalid JWT payload."
            );

        }


        return jwt.sign(

            payload,

            this.getSecret(),

            {

                expiresIn:
                process.env.JWT_EXPIRES_IN ||
                "24h"

            }

        );

    }


    /*
    ===============================================================
    Verify Authentication Token
    ===============================================================
    */

    verifyToken = (
        req,
        res,
        next
    ) => {

        try {

            const authorizationHeader =
            req.headers.authorization;


            if (!authorizationHeader) {

                return res
                .status(401)
                .json({

                    success:
                    false,

                    message:
                    "Authentication token required."

                });

            }


            const parts =
            authorizationHeader
            .trim()
            .split(/\s+/);


            if (

                parts.length !== 2 ||

                parts[0].toLowerCase() !==
                "bearer"

            ) {

                return res
                .status(401)
                .json({

                    success:
                    false,

                    message:
                    "Invalid authentication format."

                });

            }


            const token =
            parts[1];


            if (!token) {

                return res
                .status(401)
                .json({

                    success:
                    false,

                    message:
                    "Authentication token required."

                });

            }


            const decoded =
            jwt.verify(

                token,

                this.getSecret()

            );


            req.user =
            decoded;


            next();

        }

        catch (error) {

            let message =
            "Invalid authentication token.";


            if (
                error.name ===
                "TokenExpiredError"
            ) {

                message =
                "Authentication token expired.";

            }


            return res
            .status(401)
            .json({

                success:
                false,

                message

            });

        }

    };


    /*
    ===============================================================
    Optional Token Verification
    ===============================================================
    */

    optionalVerifyToken = (
        req,
        res,
        next
    ) => {

        try {

            const authorizationHeader =
            req.headers.authorization;


            if (!authorizationHeader) {

                req.user =
                null;

                return next();

            }


            const parts =
            authorizationHeader
            .trim()
            .split(/\s+/);


            if (

                parts.length !== 2 ||

                parts[0].toLowerCase() !==
                "bearer"

            ) {

                req.user =
                null;

                return next();

            }


            const token =
            parts[1];


            req.user =
            jwt.verify(

                token,

                this.getSecret()

            );


            return next();

        }

        catch (error) {

            req.user =
            null;

            return next();

        }

    };


    /*
    ===============================================================
    Administrator Authorization
    ===============================================================
    */

    requireAdmin = (
        req,
        res,
        next
    ) => {

        if (

            !req.user ||

            req.user.role !==
            "ADMIN"

        ) {

            return res
            .status(403)
            .json({

                success:
                false,

                message:
                "Administrator access required."

            });

        }


        return next();

    };

}


module.exports =
new AuthMiddleware();