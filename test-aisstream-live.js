require('dotenv').config();

const WebSocket =
require('ws');

const socket =
new WebSocket(
'wss://stream.aisstream.io/v0/stream'
);

socket.on('open', () => {

console.log(
'CONNECTED TO AISSTREAM'
);

const subscriptionMessage = {

APIKey:
process.env.AIS_API_KEY,

BoundingBoxes: [[

[5.0,60.0],
[35.0,100.0]

]]

};

socket.send(
JSON.stringify(
subscriptionMessage
)
);

console.log(
'SUBSCRIPTION SENT'
);

});

socket.on('message', data => {

const message =
JSON.parse(
data.toString()
);

console.log(
JSON.stringify(
message,
null,
2
)
);

process.exit();

});

socket.on('error', error => {

console.log(
'ERROR:',
error.message
);

});