const portComparisonEngine =
require('./engine/portComparisonEngine');

const result =

portComparisonEngine
.generateComparison();

console.log(
JSON.stringify(
result,
null,
2
)
);