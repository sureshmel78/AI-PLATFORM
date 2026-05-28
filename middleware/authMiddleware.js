const jwt=require('jsonwebtoken');

class AuthMiddleware{

/*
====================================================
GENERATE TOKEN
====================================================
*/

generateToken(user){

return jwt.sign(

{

username:user.username,

role:user.role

},

process.env.JWT_SECRET
||
'enterprise_secret_key',

{

expiresIn:'12h'

}

);

}

/*
====================================================
VERIFY TOKEN
====================================================
*/

verifyToken(req,res,next){

try{

const authHeader=
req.headers.authorization;

if(!authHeader){

return res
.status(401)
.json({

success:false,

message:
'Authorization token missing'

});

}

const token=
authHeader.split(' ')[1];

const decoded=

jwt.verify(

token,

process.env.JWT_SECRET
||
'enterprise_secret_key'

);

req.user=
decoded;

next();

}
catch(error){

return res
.status(401)
.json({

success:false,

message:
'Invalid token'

});

}

}

/*
====================================================
ROLE CHECK
====================================================
*/

authorize(...roles){

return(req,res,next)=>{

if(

!req.user ||

!roles.includes(
req.user.role
)

){

return res
.status(403)
.json({

success:false,

message:
'Access denied'

});

}

next();

};

}

}

module.exports=
new AuthMiddleware();