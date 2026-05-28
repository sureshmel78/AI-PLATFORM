const gateway=
require('../feeds/gateway');

class LiveFeeds{

/*
====================================================
LIVE ENTERPRISE INTELLIGENCE
====================================================
*/

async getLiveIntelligence(){

try{

const feeds=

await gateway
.getEnterpriseFeeds();

/*
====================================================
MARKET SENTIMENT
====================================================
*/

const marketSentiment=

feeds.freight.sentiment||
'STABLE';

/*
====================================================
WEATHER RISK
====================================================
*/

const weatherRisk=

feeds.weather.risk||
'LOW';

/*
====================================================
EFFICIENCY LOGIC
====================================================
*/

let operationalEfficiency=95;

if(
weatherRisk==='HIGH'
){

operationalEfficiency-=15;

}

if(
feeds.ais.activeVessels>10
){

operationalEfficiency-=5;

}

if(
feeds.freight.volatility==='HIGH'
){

operationalEfficiency-=5;

}

operationalEfficiency=
`${operationalEfficiency}%`;

/*
====================================================
RESPONSE
====================================================
*/

return{

platformStatus:
feeds.status,

marketSentiment,

weatherRisk,

operationalEfficiency,

activeVessels:
feeds.ais.activeVessels,

freightIndex:
feeds.freight.index,

weatherProvider:
feeds.weather.provider,

aisProvider:
feeds.ais.provider,

generatedAt:
feeds.timestamp

};

}
catch(error){

console.log(

'LiveFeeds Error:',
error.message

);

return{

platformStatus:
'ERROR',

marketSentiment:
'UNKNOWN',

weatherRisk:
'UNKNOWN',

operationalEfficiency:
'0%',

activeVessels:0,

generatedAt:
new Date()
.toISOString()

};

}

}

}

module.exports=
new LiveFeeds();