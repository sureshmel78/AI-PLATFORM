require("dotenv").config();
const assert = require("assert");
const aisProvider = require("./providers/aisProvider");
const aisCacheService = require("./services/aisCacheService");
const gateway = require("./feeds/gateway");

async function test() {
    const status = aisProvider.getStatus();
    assert.strictEqual(status.version, "3.0.0");

    const vessels = await aisProvider.getLiveVessels();
    assert.ok(Array.isArray(vessels) && vessels.length > 0);
    vessels.forEach(vessel => {
        assert.ok(Number.isFinite(vessel.latitude));
        assert.ok(Number.isFinite(vessel.longitude));
        assert.strictEqual(typeof vessel.isLive, "boolean");
    });

    const cached = await aisCacheService.refresh();
    assert.strictEqual(cached.length, vessels.length);
    assert.strictEqual(aisCacheService.getStatus().version, "3.0.0");

    const feeds = await gateway.getEnterpriseFeeds();
    assert.ok(Array.isArray(feeds.ais.vessels));
    assert.strictEqual(feeds.ais.activeVessels, vessels.length);

    console.log("AIS INTELLIGENCE CONTRACT: PASS");
    console.log(JSON.stringify({ provider: status, cache: aisCacheService.getStatus(), gatewayAIS: {
        activeVessels: feeds.ais.activeVessels,
        movingVessels: feeds.ais.movingVessels,
        anchoredVessels: feeds.ais.anchoredVessels,
        provider: feeds.ais.provider
    }}, null, 2));
}

test().catch(error => { console.error(error); process.exit(1); });
