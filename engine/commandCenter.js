const optimizer =
require("./optimizer");

const predictiveEngine =
require("./predictiveEngine");

const riskEngine =
require("./riskEngine");

const strategy =
require("./strategy");

class CommandCenter {

async generateExecutiveView(){

try{

const deals =
await optimizer.buildDeals();

if(
!deals ||
deals.length===0
){

return{

status:"NO_DATA",

message:
"No voyage intelligence available"

};

}

const bestDeal=
deals[0];

/*
==========================
FORECAST
==========================
*/

const freightForecast =

predictiveEngine
.predictFreightTrend([

3200,
3350,
3500,
3600,
3700

]);

/*
==========================
RISK
==========================
*/

const risk =

riskEngine
.calculateVoyageRisk({

weatherRisk:

bestDeal.weatherWind>30
?"HIGH"
:"LOW",

fuelRisk:

bestDeal.utilization<60
?"HIGH"
:"LOW",

congestionRisk:
bestDeal.liveCongestion,

routeDeviation:false

});

/*
==========================
MULTI AGENTS
==========================
*/

const marketView=

strategy.marketAgent(
bestDeal
);

const riskView=

strategy.riskAgent(
bestDeal
);

const profitView=

strategy.profitAgent(
bestDeal
);

const trendView=

strategy.trendAgent(
bestDeal
);

const scenarioView=

strategy.scenarioAgent(
bestDeal
);

const supervisor=

strategy.supervisorAgent(

marketView,
riskView,
profitView,
trendView,
scenarioView

);

/*
==========================
RETURN
==========================
*/

return{

supervisor,

marketAgent:
marketView,

riskAgent:
riskView,

profitAgent:
profitView,

trendAgent:
trendView,

scenarioAgent:
scenarioView,

forecast:
freightForecast,

risk,

bestVoyage:{

vessel:
bestDeal.vessel,

route:
bestDeal.route,

profit:
bestDeal.profit,

confidence:
bestDeal.confidence

},

generatedAt:
new Date()
.toISOString()

};

}
catch(error){

return{

error:true,

message:
error.message

};

}

}

}

module.exports=
new CommandCenter();