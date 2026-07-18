const commandCenter=
require("./commandCenter");

const predictiveEngine=
require("./predictiveEngine");

class Copilot{

async ask(question){

try{

const query=
question.toLowerCase();

const executiveData=

await commandCenter
.generateExecutiveView();

/*
====================================
SUPERVISOR
====================================
*/

if(
query.includes("fix now")
||
query.includes("supervisor")
||
query.includes("decision")
){

return{

answer:

`Supervisor decision: ${executiveData.supervisor.decision}

Consensus Score:
${executiveData.supervisor.consensus}

Reason:
${executiveData.supervisor.message}`

};

}

/*
====================================
MARKET
====================================
*/

if(
query.includes("market")
||
query.includes("freight")
){

return{

answer:

`Market State:
${executiveData.marketAgent.state}

Score:
${executiveData.marketAgent.score}

Forecast:
${executiveData.forecast.trend}`

};

}

/*
====================================
RISK
====================================
*/

if(
query.includes("risk")
){

return{

answer:

`Risk Level:
${executiveData.risk.overallRisk}

Recommendation:
${executiveData.risk.recommendation}`

};

}

/*
====================================
BEST VOYAGE
====================================
*/

if(
query.includes("voyage")
||
query.includes("profit")
||
query.includes("best")
){

return{

answer:

`Best Voyage:

Vessel:
${executiveData.bestVoyage.vessel}

Route:
${executiveData.bestVoyage.route}

Profit:
$${executiveData.bestVoyage.profit}

Confidence:
${executiveData.bestVoyage.confidence}%`

};

}

/*
====================================
DEFAULT
====================================
*/

return{

answer:

`I can answer:

• supervisor decision
• freight forecast
• market outlook
• voyage risk
• best voyage
• profit outlook`

};

}
catch(error){

return{

answer:
`Copilot Error: ${error.message}`

};

}

}

}

module.exports=
new Copilot();