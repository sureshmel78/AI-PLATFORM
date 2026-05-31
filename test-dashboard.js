const executiveDashboard =
require('./engine/executiveDashboard');

async function test(){

const result =

await executiveDashboard
.generateDashboard();

console.log(
JSON.stringify(
result,
null,
2
)
);

}

test();