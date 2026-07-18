const Vessel=
require("../models/vessel");

const Cargo=
require("../models/cargo");

const IntelligenceLog=
require("../models/intelligenceLog");

const gateway=
require("../feeds/gateway");

/* =========================
MARKET ENGINE
========================= */

function getCargoStrength(cargo){

const map={

Coal:92,
IronOre:95,
Containers:98,
Grain:75,
Fertilizer:70

};

return map[cargo]||60;

}

function getPortStrength(port){

const map={

Rotterdam:98,
Singapore:99,
Shanghai:97,
Dubai:90,
Hamburg:88,
Chennai:70,
Tuticorin:72

};

return map[port]||60;

}

/* =========================
AI OPTIMIZER
========================= */

async function buildDeals(){

const vessels=
await Vessel.find();

const cargoes=
await Cargo.find();

const feeds=
await gateway
.getEnterpriseFeeds();

const deals=[];

for(const v of vessels){

for(const c of cargoes){

const cargoStrength=
getCargoStrength(c.name);

const loadStrength=
getPortStrength(c.load);

const dischargeStrength=
getPortStrength(c.discharge);

const marketScore=
Math.round(

(
cargoStrength+
loadStrength+
dischargeStrength
)/3

);

let freight=
feeds.freight.index;

if(
feeds.freight.sentiment
==="BULLISH"
){
freight+=200;
}

const profit=
Math.round(
freight*
(c.qty/1000)
);

const confidence=
Math.min(

99,

Math.round(
marketScore*0.6+80*0.4
)

);

const deal={

vessel:v.name,

cargo:c.name,

route:
`${c.load}-${c.discharge}`,

profit,

confidence,

market:
marketScore,

delay:6,

utilization:85,

forecast:profit

};

deals.push(deal);

await IntelligenceLog.create({

category:
"OPTIMIZER",

severity:
"LOW",

message:
`Optimization generated for ${v.name}`,

metadata:{
profit,
confidence
}

});

}

}

deals.sort(
(a,b)=>b.profit-a.profit
);

return deals;

}

module.exports={

buildDeals

};