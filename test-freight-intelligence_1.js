const assert = require("assert");
const freightProvider = require("./providers/freightProvider");
const gateway = require("./feeds/gateway");

(async () => {
    const status = freightProvider.getStatus();
    const freight = await freightProvider.getFreightData();
    const feeds = await gateway.getEnterpriseFeeds();

    assert.strictEqual(status.status, "FREIGHT_PROVIDER_ACTIVE");
    assert.ok(Number.isFinite(freight.index) && freight.index > 0);
    assert.strictEqual(freight.freightIndex, freight.index);
    assert.ok(["BULLISH", "BEARISH", "NEUTRAL"].includes(freight.sentiment));
    assert.strictEqual(freight.marketSentiment, freight.sentiment);
    assert.ok(typeof freight.isLive === "boolean");
    assert.ok(feeds.freight);
    assert.strictEqual(feeds.freight.sentiment, feeds.freight.marketSentiment);
    assert.ok(Number.isFinite(feeds.freight.index));

    console.log(JSON.stringify({
        test: "FREIGHT_INTELLIGENCE_V3",
        result: "PASS",
        providerStatus: status,
        freight: feeds.freight
    }, null, 2));
})().catch(error => {
    console.error(error);
    process.exit(1);
});
