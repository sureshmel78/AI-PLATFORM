const Vessel = require("../models/Vessel");
const Cargo = require("../models/Cargo");
const Deal = require("../models/Deal");

function score(v,c){

let s = 0;

if(v.dwt >= c.qty) s += 40;

if(v.location === c.loadPort) s += 30;

s += 20;

return s;

}

async function runMatching(){

const vessels = await Vessel.find();
const cargoes = await Cargo.find();

for(const v of vessels){

for(const c of cargoes){

const sc = score(v,c);

if(sc >= 60){

await Deal.create({
vessel:v.name,
cargo:c.commodity,
score:sc,
created:new Date()
});

}

}

}

}

module.exports = { runMatching };