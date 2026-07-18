const {
externalIntelligence
}=require("../feeds/gateway");

const commodityStrength={

coal:92,
ironore:95,
grain:80,
cement:72,
woodpulp:76,
fertilizer:83,
scrap:78,
containers:88

};

const portKPIs={

rotterdam:{
throughput:99,
connectivity:98,
congestion:82,
reliability:97,
draft:99
},

singapore:{
throughput:98,
connectivity:99,
congestion:88,
reliability:96,
draft:96
},

richardsbay:{
throughput:90,
connectivity:84,
congestion:80,
reliability:88,
draft:94
},

tuticorin:{
throughput:74,
connectivity:72,
congestion:76,
reliability:82,
draft:78
},

fujairah:{
throughput:82,
connectivity:90,
congestion:86,
reliability:88,
draft:84
},

mumbai:{
throughput:84,
connectivity:80,
congestion:70,
reliability:76,
draft:79
}

};

function scoreCommodity(name){

return commodityStrength[
name.toLowerCase().replace(/\s/g,"")
]||70;

}

function calculatePortScore(port){

const p=portKPIs[
port.toLowerCase().replace(/\s/g,"")
];

if(!p)return 65;

const score=Math.round(

(p.throughput*0.30)+
(p.connectivity*0.25)+
(p.reliability*0.20)+
(p.draft*0.15)+
(p.congestion*0.10)

);

return score;

}

function delayHours(portScore){

if(portScore>95)return 2;
if(portScore>90)return 4;
if(portScore>80)return 8;
if(portScore>70)return 16;

return 30;

}

async function marketIntel(cargo){

const live=
await externalIntelligence();

const commodity=
scoreCommodity(cargo.name);

const load=
calculatePortScore(cargo.load);

const discharge=
calculatePortScore(cargo.discharge);

let market=Math.round(
(commodity+load+discharge)/3
);

if(
live.sentiment.state==="BULLISH"
)market+=8;

if(
live.sentiment.state==="WEAK"
)market-=8;

if(market>100)market=100;
if(market<40)market=40;

const forecast=

15000+
market*120+
(live.freight.index*2);

const confidence=

70+
Math.floor((market-60)/2);

const bunker=
live.bunker.price;

const delay=

delayHours(discharge)+
Math.floor(
live.congestion.level/15
);

return{

forecast,
confidence,
market,
bunker,
delay,

liveSentiment:
live.sentiment.state,

liveFreightIndex:
live.freight.index,

liveCongestion:
live.congestion.level,

liveTimestamp:
live.sentiment.updated,

feedSource:
live.bunker.source

};

}

module.exports={marketIntel};