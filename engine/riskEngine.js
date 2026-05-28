class RiskEngine {

    calculateVoyageRisk({
        weatherRisk,
        fuelRisk,
        congestionRisk,
        routeDeviation
    }) {

        let score = 0;

        // WEATHER

        if (weatherRisk === 'HIGH') {
            score += 35;
        } else if (weatherRisk === 'MEDIUM') {
            score += 20;
        } else {
            score += 5;
        }

        // FUEL

        if (fuelRisk === 'HIGH') {
            score += 25;
        } else if (fuelRisk === 'MEDIUM') {
            score += 15;
        } else {
            score += 5;
        }

        // CONGESTION

        if (congestionRisk === 'HIGH') {
            score += 20;
        } else if (congestionRisk === 'MEDIUM') {
            score += 10;
        } else {
            score += 3;
        }

        // ROUTE

        if (routeDeviation === true) {
            score += 20;
        }

        let overallRisk = 'LOW';

        if (score >= 70) {
            overallRisk = 'HIGH';
        } else if (score >= 40) {
            overallRisk = 'MEDIUM';
        }

        return {
            totalRiskScore: score,

            overallRisk,

            recommendation:
                overallRisk === 'HIGH'
                    ? 'Immediate operational intervention required'
                    : overallRisk === 'MEDIUM'
                    ? 'Close voyage monitoring recommended'
                    : 'Voyage operating within acceptable limits',

            generatedAt: new Date().toISOString(),

            status: 'VOYAGE_RISK_GENERATED'
        };
    }

    calculatePortRisk({
        congestionLevel,
        weatherImpact,
        berthDelay
    }) {

        let score = 0;

        if (congestionLevel === 'HIGH') {
            score += 40;
        } else if (congestionLevel === 'MEDIUM') {
            score += 20;
        }

        if (weatherImpact === 'HIGH') {
            score += 30;
        } else if (weatherImpact === 'MEDIUM') {
            score += 15;
        }

        if (berthDelay > 24) {
            score += 30;
        } else if (berthDelay > 12) {
            score += 15;
        }

        let riskLevel = 'LOW';

        if (score >= 70) {
            riskLevel = 'HIGH';
        } else if (score >= 40) {
            riskLevel = 'MEDIUM';
        }

        return {
            portRiskScore: score,

            riskLevel,

            recommendation:
                riskLevel === 'HIGH'
                    ? 'Port congestion mitigation required'
                    : 'Port operating within acceptable thresholds',

            generatedAt: new Date().toISOString(),

            status: 'PORT_RISK_GENERATED'
        };
    }

    calculateMarketRisk({
        freightTrend,
        bunkerTrend,
        volatility
    }) {

        let score = 0;

        if (freightTrend === 'BEARISH') {
            score += 35;
        }

        if (bunkerTrend === 'RISING') {
            score += 25;
        }

        if (volatility === 'HIGH') {
            score += 40;
        } else if (volatility === 'MEDIUM') {
            score += 20;
        }

        let marketRisk = 'LOW';

        if (score >= 70) {
            marketRisk = 'HIGH';
        } else if (score >= 40) {
            marketRisk = 'MEDIUM';
        }

        return {
            marketRiskScore: score,

            marketRisk,

            recommendation:
                marketRisk === 'HIGH'
                    ? 'Market hedge strategy recommended'
                    : 'Market conditions acceptable',

            generatedAt: new Date().toISOString(),

            status: 'MARKET_RISK_GENERATED'
        };
    }
}

module.exports = new RiskEngine();