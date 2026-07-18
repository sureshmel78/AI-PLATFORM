require('dotenv').config();

class Environment{

constructor(){

this.environment=

process.env.NODE_ENV
||'development';

}

isDevelopment(){

return this.environment
==='development';

}

isProduction(){

return this.environment
==='production';

}

getConfig(){

return{

environment:
this.environment,

port:
process.env.PORT || 5000,

mongoURI:
process.env.MONGO_URI,

jwtSecret:
process.env.JWT_SECRET,

adminUser:
process.env.ADMIN_USER,

aisProvider:
process.env.AIS_PROVIDER,

weatherProvider:
process.env.WEATHER_PROVIDER

};

}

}

module.exports=
new Environment();