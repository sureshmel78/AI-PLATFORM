const aisCacheService =
require('../services/aisCacheService');

class AISProvider {

constructor(){

this.provider =
'AISSTREAM';

}

/*
====================================================
LIVE VESSELS
====================================================
*/

async getLiveVessels(){

const vessels =
aisCacheService.getVessels();

if(
vessels &&
vessels.length > 0
){

return vessels;

}

return this.getFallbackData();

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