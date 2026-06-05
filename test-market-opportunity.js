const marketOpportunityEngine =
require('./engine/marketOpportunityEngine');

const result =

marketOpportunityEngine
.generateOpportunities();

console.log(
JSON.stringify(
result,
null,
2
)
);