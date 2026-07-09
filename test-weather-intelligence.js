const assert = require("assert");
const weatherProvider = require("./providers/weatherProvider");

(async () => {
    const original = weatherProvider.apiEnabled;
    weatherProvider.apiEnabled = false;
    const data = await weatherProvider.getCurrentWeather(8.7642, 78.1348);
    assert.strictEqual(weatherProvider.getStatus().version, "3.0.0");
    assert.strictEqual(data.isLive, false);
    assert.strictEqual(data.risk, data.riskLevel);
    assert(Number.isFinite(data.windSpeed));
    assert(Number.isFinite(data.waveHeight));
    assert(Number.isFinite(data.visibility));
    assert(["LOW", "MEDIUM", "HIGH"].includes(data.riskLevel));
    weatherProvider.apiEnabled = original;
    console.log("WEATHER INTELLIGENCE CONTRACT: PASS");
    console.log(JSON.stringify(data, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
