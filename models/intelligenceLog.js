const mongoose=require('mongoose');

const intelligenceLogSchema=

new mongoose.Schema({

category:{

type:String,

required:true

},

severity:{

type:String,

default:'LOW'

},

source:{

type:String,

default:'SYSTEM'

},

message:{

type:String,

required:true

},

/*
====================================================
AUDIT
====================================================
*/

username:{

type:String,

default:'SYSTEM'

},

role:{

type:String,

default:'SYSTEM'

},

action:{

type:String,

default:'UNKNOWN'

},

ipAddress:{

type:String,

default:'N/A'

},

status:{

type:String,

default:'SUCCESS'

},

metadata:{

type:Object,

default:{}

},

generatedAt:{

type:Date,

default:Date.now

}

},

{

timestamps:true

}

);

module.exports=

mongoose.model(

'IntelligenceLog',

intelligenceLogSchema

);