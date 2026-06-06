const gateway =
require('../feeds/gateway');

const congestionEngine =
require('./congestionEngine');

const vesselRiskEngine =
require('./vesselRiskEngine');

const businessIntelligenceEngine =
require('./businessIntelligenceEngine');

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

const businessIntelligence =

businessIntelligenceEngine
.generateBusinessIntelligence();

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
.overallRisk,

revenueOpportunityCrores:
businessIntelligence
.executiveSummary
.revenueOpportunityCrores,

additionalCalls:
businessIntelligence
.executiveSummary
.additionalCalls,

transshipmentPotential:
businessIntelligence
.executiveSummary
.transshipmentPotential,

highestRiskPort:
businessIntelligence
.executiveSummary
.highestRiskPort

},

congestionIntelligence,

vesselRisk,

businessIntelligence,

generatedAt:
new Date()
.toISOString()

};

}

}

module.exports =
new ExecutiveDashboard();