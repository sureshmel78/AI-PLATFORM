require("dotenv").config();
const assert = require("assert");

process.env.AISSTREAM_API_KEY = "TEST_KEY";
const service = require("./services/aisStreamService");

class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.listeners = {};
    this.sent = [];
    MockWebSocket.instance = this;
  }

  addEventListener(name, callback) {
    this.listeners[name] = callback;
  }

  send(data) {
    this.sent.push(data);
  }

  close() {}

  emit(name, data = {}) {
    if (this.listeners[name]) this.listeners[name](data);
  }
}

service.stop();
service.apiKey = "TEST_KEY";
service.start(MockWebSocket);

const socket = MockWebSocket.instance;
socket.emit("open");

assert.equal(service.getStatus().connected, true);
assert.equal(service.getStatus().subscribed, true);

const subscription = JSON.parse(socket.sent[0]);
assert.equal(subscription.APIKey, "TEST_KEY");
assert.ok(Array.isArray(subscription.BoundingBoxes));

socket.emit("message", {
  data: JSON.stringify({
    MessageType: "PositionReport",
    MetaData: {
      MMSI: 419001234,
      ShipName: "LIVE TEST VESSEL",
      latitude: 8.75,
      longitude: 78.20
    },
    Message: {
      PositionReport: {
        Sog: 12.4,
        Cog: 45,
        TrueHeading: 44,
        NavigationalStatus: 0
      }
    }
  })
});

const vessels = service.getLiveVessels();

assert.equal(vessels.length, 1);
assert.equal(vessels[0].mmsi, "419001234");
assert.equal(vessels[0].provider, "AISSTREAM");
assert.equal(vessels[0].sourceType, "LIVE_STREAM");
assert.equal(vessels[0].isLive, true);
assert.equal(service.getStatus().status, "LIVE");

service.stop();

console.log("AISSTREAM LIVE ADAPTER CONTRACT: PASS");
console.log(JSON.stringify(vessels[0], null, 2));
