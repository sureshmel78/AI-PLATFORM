const WebSocket =
require('ws');

class AISProvider {

constructor(){

this.provider =
process.env.AIS_PROVIDER ||
'AISSTREAM';

this.apiKey =
process.env.AIS_API_KEY || '';

console.log(
'AIS KEY LENGTH:',
this.apiKey.length
);

}

async getSingleLiveVessel(){

return new Promise((resolve,reject)=>{

const socket =
new WebSocket(
'wss://stream.aisstream.io/v0/stream'
);

socket.on('open',()=>{

socket.send(
JSON.stringify({

APIKey:
this.apiKey,

BoundingBoxes:[[

[5.0,60.0],
[35.0,100.0]

]]

})
);

});

socket.on('message',data=>{

const message =
JSON.parse(
data.toString()
);

socket.close();

resolve(message);

});

socket.on('error',error=>{

reject(error);

});

});

}

/*
====================================================
LIVE VESSELS
====================================================
*/

async getLiveVessels(){

try{

if(!this.apiKey){

console.log(
'AIS API key missing, using fallback'
);

return this.getFallbackData();

}

const liveVessel =
await this.getSingleLiveVessel();

return [{

name:
liveVessel.MetaData?.ShipName?.trim()
|| 'UNKNOWN',

mmsi:
liveVessel.MetaData?.MMSI,

latitude:
liveVessel.MetaData?.latitude,

longitude:
liveVessel.MetaData?.longitude,

navigationStatus:
'LIVE',

provider:
this.provider

}];

}
catch(error){

console.log(
'AIS Provider Error:',
error.message
);

return this.getFallbackData();

}

}

/*
====================================================
FALLBACK
====================================================
*/

getFallbackData(){

return [

{

name:'MSC MARINA',

vesselType:'Container',

speed:15.2,

destination:'Singapore',

eta:
new Date(
Date.now()+42*60*60*1000
).toISOString(),

navigationStatus:'FALLBACK',

provider:'LOCAL'

}

];

}

}

module.exports =
new AISProvider();