const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

const User=require("../models/user");

const SECRET="AI_SHIPPING_SECRET";

/* CREATE DEFAULT ADMIN */

async function createDefaultAdmin(){

/* DELETE OLD ADMIN */

await User.deleteMany({

username:"admin"

});

const hashed=
await bcrypt.hash(
"admin123",
10
);

await User.create({

username:"admin",
password:hashed,
role:"admin"

});

console.log(
"Fresh admin created"
);

}

async function registerUser(

username,
password,
role="viewer"

){

const existing=
await User.findOne({username});

if(existing){

return{
error:"User already exists"
};

}

const hashed=
await bcrypt.hash(password,10);

const user=
await User.create({

username,
password:hashed,
role

});

return{

message:"User created",

user:user.username

};

}

async function loginUser(

username,
password

){

const user=
await User.findOne({username});

if(!user){

return{
error:"Invalid username"
};

}

const valid=
await bcrypt.compare(
password,
user.password
);

if(!valid){

return{
error:"Invalid password"
};

}

const token=
jwt.sign({

id:user._id,
username:user.username,
role:user.role

},

SECRET,

{
expiresIn:"7d"
}

);

return{

message:"Login successful",

token,

role:user.role

};

}

module.exports={

registerUser,
loginUser,
createDefaultAdmin,
SECRET

};