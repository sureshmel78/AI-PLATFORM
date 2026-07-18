const businessIntelligenceEngine =
require('./engine/businessIntelligenceEngine');

const result =

businessIntelligenceEngine
.generateBusinessIntelligence();

console.log(
JSON.stringify(
result,
null,
2
)
);