function marketAgent(deal){

if(
deal.market>85 &&
deal.confidence>80 &&
deal.forecast>25000
){

return{
agent:"MARKET AGENT",
state:"BULLISH",
score:90,
message:"Strong freight environment detected"
};

}

if(
deal.market>70 &&
deal.confidence>70
){

return{
agent:"MARKET AGENT",
state:"STABLE",
score:70,
message:"Balanced freight conditions"
};

}

return{
agent:"MARKET AGENT",
state:"WEAK",
score:40,
message:"Weak market momentum"
};

}

function riskAgent(deal){

let score=100;

if(deal.delay>20)score-=40;
if(deal.utilization<60)score-=30;
if(deal.market<70)score-=20;

if(score>80){

return{
agent:"RISK AGENT",
state:"LOW RISK",
score,
message:"Operational exposure acceptable"
};

}

if(score>60){

return{
agent:"RISK AGENT",
state:"MODERATE RISK",
score,
message:"Monitor operational conditions"
};

}

return{
agent:"RISK AGENT",
state:"HIGH RISK",
score,
message:"Voyage risk elevated"
};

}

function profitAgent(deal){

if(deal.profit>1500000000){

return{
agent:"PROFIT AGENT",
state:"HIGH VALUE",
score:95,
message:"Exceptional earnings potential"
};

}

if(deal.profit>800000000){

return{
agent:"PROFIT AGENT",
state:"ATTRACTIVE",
score:75,
message:"Commercially attractive voyage"
};

}

return{
agent:"PROFIT AGENT",
state:"WEAK",
score:45,
message:"Low commercial attractiveness"
};

}

function trendAgent(deal){

let trendScore=0;

if(deal.market>85)trendScore+=30;
if(deal.confidence>80)trendScore+=25;
if(deal.delay<10)trendScore+=20;
if(deal.profit>1000000000)trendScore+=25;

if(trendScore>=80){

return{
agent:"TREND AGENT",
state:"IMPROVING",
score:90,
message:"Voyage outlook strengthening"
};

}

if(trendScore>=60){

return{
agent:"TREND AGENT",
state:"STABLE",
score:70,
message:"Voyage outlook stable"
};

}

return{
agent:"TREND AGENT",
state:"DECLINING",
score:45,
message:"Voyage outlook weakening"
};

}

function scenarioAgent(deal){

const stressedProfit=
deal.profit*0.75;

if(stressedProfit>1000000000){

return{
agent:"SCENARIO AGENT",
state:"RESILIENT",
score:90,
message:"Voyage remains profitable under stress"
};

}

if(stressedProfit>500000000){

return{
agent:"SCENARIO AGENT",
state:"VULNERABLE",
score:65,
message:"Voyage moderately exposed to stress"
};

}

return{
agent:"SCENARIO AGENT",
state:"HIGHLY EXPOSED",
score:40,
message:"Voyage highly vulnerable under stress"
};

}

function supervisorAgent(
marketView,
riskView,
profitView,
trendView,
scenarioView
){

const consensus=Math.round(

(
marketView.score+
riskView.score+
profitView.score+
trendView.score+
scenarioView.score
)/5

);

if(consensus>85){

return{
decision:"FIX NOW",
consensus,
message:"Strong multi-agent consensus"
};

}

if(consensus>65){

return{
decision:"HOLD",
consensus,
message:"Moderate multi-agent support"
};

}

return{
decision:"REJECT",
consensus,
message:"Insufficient multi-agent confidence"
};

}

module.exports={

marketAgent,
riskAgent,
profitAgent,
trendAgent,
scenarioAgent,
supervisorAgent

};