const memory={

successfulRoutes:{},
successfulCargoes:{},
successfulVessels:{}

};

function remember(deal){

if(deal.profit>1000000000){

memory.successfulRoutes[
deal.route
]=(memory.successfulRoutes[
deal.route
]||0)+1;

memory.successfulCargoes[
deal.cargo
]=(memory.successfulCargoes[
deal.cargo
]||0)+1;

memory.successfulVessels[
deal.vessel
]=(memory.successfulVessels[
deal.vessel
]||0)+1;

}

}

function memoryScore(deal){

const route=
memory.successfulRoutes[
deal.route
]||0;

const cargo=
memory.successfulCargoes[
deal.cargo
]||0;

const vessel=
memory.successfulVessels[
deal.vessel
]||0;

return Math.min(
route+cargo+vessel,
20
);

}

module.exports={

remember,
memoryScore

};