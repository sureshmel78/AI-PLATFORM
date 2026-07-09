const assert = require("assert");
const bunkerProvider = require("./providers/bunkerProvider");
const gateway = require("./feeds/gateway");
const { marketIntel } = require("./engine/market");

(async () => {
    const bunker = await bunkerProvider.getBunkerData();
    assert.strictEqual(bunker.version, "3.0.0");
    assert.ok(Number.isFinite(bunker.price) && bunker.price > 0);
    assert.ok(typeof bunker.isLive === "boolean");

    const feeds = await gateway.getEnterpriseFeeds();
    assert.strictEqual(feeds.bunker.price, bunker.price);
    assert.ok(feeds.bunker.sourceType);

    const legacy = await gateway.externalIntelligence();
    assert.ok(Number.isFinite(legacy.bunker.price));
    assert.ok(Number.isFinite(legacy.congestion.level));

    const market = await marketIntel({ name: "coal", load: "tuticorin", discharge: "singapore" });
    assert.ok(Number.isFinite(market.forecast));
    assert.ok(Number.isFinite(market.bunker));
    assert.ok(Number.isFinite(market.delay));

    console.log("BUNKER INTELLIGENCE CONTRACT: PASS");
    console.log(JSON.stringify({ bunker: feeds.bunker, marketCompatibility: market }, null, 2));
})().catch(error => {
    console.error("BUNKER INTELLIGENCE CONTRACT: FAIL");
    console.error(error);
    process.exit(1);
});
