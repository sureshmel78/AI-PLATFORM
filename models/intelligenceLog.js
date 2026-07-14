/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Intelligence Log Model
Version : 2.0.0
===============================================================
*/

const mongoose =
require("mongoose");


const intelligenceLogSchema =
new mongoose.Schema(

    {

        category: {

            type:
            String,

            required:
            true,

            trim:
            true,

            uppercase:
            true,

            index:
            true

        },


        severity: {

            type:
            String,

            default:
            "UNKNOWN",

            trim:
            true,

            uppercase:
            true,

            index:
            true

        },


        source: {

            type:
            String,

            default:
            "AI_ENGINE",

            trim:
            true,

            uppercase:
            true

        },


        message: {

            type:
            String,

            required:
            true,

            trim:
            true

        },


        action: {

            type:
            String,

            default:
            "INTELLIGENCE_ANALYSIS",

            trim:
            true,

            uppercase:
            true

        },


        metadata: {

            type:
            mongoose.Schema.Types.Mixed,

            default:
            {}

        }

    },

    {

        timestamps:
        true,

        versionKey:
        false

    }

);


/*
===============================================================
Indexes
===============================================================
*/

intelligenceLogSchema.index({

    createdAt:
    -1

});


intelligenceLogSchema.index({

    category:
    1,

    createdAt:
    -1

});


intelligenceLogSchema.index({

    severity:
    1,

    createdAt:
    -1

});


/*
===============================================================
JSON Transformation
===============================================================
*/

intelligenceLogSchema.set(

    "toJSON",

    {

        transform:
        function (
            document,
            returnedObject
        ) {

            returnedObject.id =
            returnedObject._id;


            delete returnedObject._id;


            return returnedObject;

        }

    }

);


/*
===============================================================
Model
===============================================================
*/

const IntelligenceLog =

mongoose.models.IntelligenceLog ||

mongoose.model(

    "IntelligenceLog",

    intelligenceLogSchema

);


/*
===============================================================
Export
===============================================================
*/

module.exports =
IntelligenceLog;