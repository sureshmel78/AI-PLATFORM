require('dotenv').config();

const express=require('express');
const cors=require('cors');
const http=require('http');
const path=require('path');
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const {Server}=require('socket.io');

const authMiddleware=
require('./middleware/authMiddleware');

const websocketEngine=
require('./engine/websocketEngine');

const liveFeeds=
require('./engine/liveFeeds');

const aisProvider=
require('./providers/aisProvider');

const IntelligenceLog=
require('./models/intelligenceLog');

const app=express();

const server=
http.createServer(app);

const io=
new Server(server,{
cors:{
origin:'*'
}
});

app.use(cors());

app.use(express.json());

/*
====================================================
FRONTEND
====================================================
*/

app.use(
express.static(
path.join(
__dirname,
'frontend'
)
)
);

const PORT=
process.env.PORT || 5000;

/*
====================================================
MONGODB
====================================================
*/

mongoose.connect(
process.env.MONGO_URI
)
.then(()=>{

console.log(
'MongoDB Connected'
);

})
.catch(error=>{

console.log(
'MongoDB Error:',
error.message
);

});

websocketEngine
.initialize(io);

/*
====================================================
ROOT
====================================================
*/

app.get('/',(req,res)=>{

res.sendFile(

path.join(
__dirname,
'frontend',
'index.html'
)

);

});

/*
====================================================
HEALTH
====================================================
*/

app.get(
'/api/health',
async(req,res)=>{

const mongoStatus=
mongoose.connection.readyState===1
?'CONNECTED'
:'DISCONNECTED';

return res.json({

success:true,
system:'ACTIVE',
database:mongoStatus,
websocket:'ACTIVE',
timestamp:
new Date().toISOString(),
version:'10.0'

});

});

/*
====================================================
LOGIN
====================================================
*/

app.post(
'/api/auth/login',
async(req,res,next)=>{

try{

const{
username,
password
}=req.body;

if(
username
!==process.env.ADMIN_USER
){

throw new Error(
'Invalid username'
);

}

const validPassword=
await bcrypt.compare(
password,
process.env.ADMIN_PASSWORD_HASH
);

if(!validPassword){

throw new Error(
'Invalid password'
);

}

const token=
authMiddleware.generateToken({

username,
role:'ADMIN'

});

return res.json({

success:true,
token

});

}
catch(error){

next(error);

}

});

/*
====================================================
AIS
====================================================
*/

app.get(
'/api/ais/vessels',
authMiddleware.verifyToken,
async(req,res)=>{

const vessels=
await aisProvider
.getLiveVessels();

return res.json({

success:true,
data:vessels

});

});

/*
====================================================
INTELLIGENCE
====================================================
*/

app.get(
'/api/intelligence/history',
authMiddleware.verifyToken,
async(req,res)=>{

const history=
await IntelligenceLog
.find()
.sort({
createdAt:-1
})
.limit(20);

return res.json({

success:true,
data:history

});

});

/*
====================================================
ERROR
====================================================
*/

app.use(
(error,req,res,next)=>{

console.log(
error.message
);

return res.status(500)
.json({

success:false,
message:error.message

});

}
);

/*
====================================================
SERVER
====================================================
*/

server.listen(
PORT,
()=>{

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

});