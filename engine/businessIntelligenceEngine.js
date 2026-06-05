const portComparisonEngine =
require('./portComparisonEngine');

const marketOpportunityEngine =
require('./marketOpportunityEngine');

class BusinessIntelligenceEngine {

generateBusinessIntelligence(){

const portComparison =

portComparisonEngine
.generateComparison();

const marketOpportunity =

marketOpportunityEngine
.generateOpportunities();

const highestRiskPort =

portComparison.ports.find(
port => port.risk === 'HIGH'
);

return {

generatedAt:
new Date()
.toISOString(),

marketOpportunity,

portComparison,

executiveSummary:{

revenueOpportunityCrores:
marketOpportunity
.estimatedRevenueCrores,

additionalCalls:
marketOpportunity
.potentialAdditionalCalls,

transshipmentPotential:
marketOpportunity
.transshipmentPotential,

highestRiskPort:

highestRiskPort
? highestRiskPort.port
: 'NONE'

},

status:
'BUSINESS_INTELLIGENCE_GENERATED'

};

}

}

module.exports =
new BusinessIntelligenceEngine();