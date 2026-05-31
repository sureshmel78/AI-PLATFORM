const congestionEngine =
require('./engine/congestionEngine');

async function test(){

const result =
await congestionEngine
.generateCongestionIntelligence();

console.log(
JSON.stringify(
result,
null,
2
)
);

}

test();