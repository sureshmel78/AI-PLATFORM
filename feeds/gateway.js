const aisProvider=
require('../providers/aisProvider');

const weatherProvider=
require('../providers/weatherProvider');

const freightProvider=
require('../providers/freightProvider');

class Gateway{

/*
====================================================
ENTERPRISE FEED
====================================================
*/

async getEnterpriseFeeds(){

try{

const [

vessels,
weather,
freight

]=await Promise.all([

aisProvider.getLiveVessels(),

weatherProvider.getWeather(),

freightProvider.getFreightData()

]);

/*
====================================================
STANDARDIZED OUTPUT
====================================================
*/

return{

timestamp:
new Date()
.toISOString(),

status:
'ACTIVE',

ais:{

provider:
vessels[0]?.provider||
'UNKNOWN',

activeVessels:
vessels.length,

vessels

},

weather:{

temperature:
weather.temperature,

windspeed:
weather.windspeed,

weathercode:
weather.weathercode,

waveHeight:
weather.waveHeight,

visibility:
weather.visibility,

risk:
weather.risk,

provider:
weather.provider

},

freight:{

index:
freight.index,

sentiment:
freight.sentiment,

volatility:
freight.volatility,

market:
freight.market,

provider:
freight.provider

}

};

}
catch(error){

console.log(

'Gateway Error:',
error.message

);

return{

status:
'FAILED',

error:
error.message

};

}

}

}

module.exports=
new Gateway();