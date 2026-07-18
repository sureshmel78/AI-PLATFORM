require('dotenv').config();
const aisProvider =
require('./providers/aisProvider');

async function test(){

const vessels =
await aisProvider.getLiveVessels();

console.log(
JSON.stringify(
vessels,
null,
2
)
);

}

test();