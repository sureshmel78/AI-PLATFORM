const gateway =
require('../feeds/gateway');

const congestionEngine =
require('./congestionEngine');

const vesselRiskEngine =
require('./vesselRiskEngine');

class ExecutiveDashboard {

async generateDashboard(){

const [

enterpriseFeeds,
congestionIntelligence

] = await Promise.all([

gateway.getEnterpriseFeeds(),

congestionEngine
.generateCongestionIntelligence()

]);

const vesselRisk =

vesselRiskEngine
.generateRiskAssessment();

let overallStatus =
'GREEN';

if(

congestionIntelligence
.portRisk
.riskLevel === 'HIGH'

||

vesselRisk
.voyageRisk
.overallRisk === 'HIGH'

){

overallStatus =
'RED';

}
else if(

congestionIntelligence
.portRisk
.riskLevel === 'MEDIUM'

||

vesselRisk
.voyageRisk
.overallRisk === 'MEDIUM'

){

overallStatus =
'AMBER';

}

return {

platform:
'Enterprise Maritime AI Intelligence Platform',

overallStatus,

executiveSummary:{

activeVessels:
enterpriseFeeds
.ais
.activeVessels,

marketSentiment:
enterpriseFeeds
.freight
.sentiment,

weatherRisk:
enterpriseFeeds
.weather
.risk,

congestionRisk:
congestionIntelligence
.portRisk
.riskLevel,

voyageRisk:
vesselRisk
.voyageRisk
.overallRisk

},

congestionIntelligence,

vesselRisk,

generatedAt:
new Date()
.toISOString()

};

}

}

module.exports =
new ExecutiveDashboard();