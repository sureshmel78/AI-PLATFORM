class MarketOpportunityEngine {

generateOpportunities(){

const vesselGrowth = 12;

const averageRevenuePerCall = 0.15;

const estimatedRevenueCrores =
Number(
(vesselGrowth * averageRevenuePerCall)
.toFixed(2)
);

let transshipmentPotential =
'MEDIUM';

if(
vesselGrowth > 10
){

transshipmentPotential =
'HIGH';

}

return {

generatedAt:
new Date()
.toISOString(),

potentialAdditionalCalls:
vesselGrowth,

estimatedRevenueCrores,

bunkeringOpportunities:
4,

transshipmentPotential,

recommendation:

transshipmentPotential === 'HIGH'

? 'Aggressive liner engagement recommended'

: 'Maintain current business development strategy',

status:
'MARKET_OPPORTUNITY_GENERATED'

};

}

}

module.exports =
new MarketOpportunityEngine();