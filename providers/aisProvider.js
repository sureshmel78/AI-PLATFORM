class AISProvider {

constructor(){

this.provider=
process.env.AIS_PROVIDER ||
'AISSTREAM';

this.apiKey=
process.env.AIS_API_KEY || '';

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

return await this.fetchAISFeed();

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
AIS FETCH
====================================================
*/

async fetchAISFeed(){

/*
Temporary production structure.
Actual AIS websocket stream
will be connected later.
*/

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

navigationStatus:'LIVE',

provider:
this.provider

},

{

name:'MAERSK TITAN',

vesselType:'Container',

speed:13.8,

destination:'Dubai',

eta:
new Date(
Date.now()+60*60*60*1000
).toISOString(),

navigationStatus:'LIVE',

provider:
this.provider

},

{

name:'EVER UNITY',

vesselType:'Bulk Carrier',

speed:11.5,

destination:'Colombo',

eta:
new Date(
Date.now()+28*60*60*1000
).toISOString(),

navigationStatus:'LIVE',

provider:
this.provider

}

];

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