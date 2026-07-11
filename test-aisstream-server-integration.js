const fs = require("fs");
const assert = require("assert");

const server = fs.readFileSync("./server.js", "utf8");

assert.ok(
  server.includes("require('./services/aisStreamService')"),
  "AISStream service import missing from server.js"
);

assert.ok(
  /aisStreamService\s*\.start\(\);/.test(server),
  "AISStream startup call missing from server.js"
);

assert.ok(
  server.includes("/api/public/ais/status"),
  "AISStream public status route missing from server.js"
);

console.log("AISSTREAM SERVER STARTUP INTEGRATION: PASS");
