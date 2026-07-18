const marketOpportunityEngine = require('./engine/marketOpportunityEngine');

const result = marketOpportunityEngine.analyze({
    market: { freightIndex: 78, freightTrend: 8 },
    cargo: { demandIndex: 82, volume: 65000 },
    vessel: { availabilityIndex: 72, utilization: 45 },
    port: { congestionIndex: 35, waitingTime: 2 },
    risk: { volatility: 30, geopoliticalRisk: 25, operationalRisk: 20 },
    commercial: { profit: 250000, tce: 42000, margin: 28 }
});

console.log(JSON.stringify(result, null, 2));
