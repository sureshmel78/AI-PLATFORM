const vesselRiskEngine =
require('./engine/vesselRiskEngine');

const result =

vesselRiskEngine
.generateRiskAssessment();

console.log(
JSON.stringify(
result,
null,
2
)
);