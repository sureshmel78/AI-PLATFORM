/**
 * ============================================================
 * AI-PLATFORM
 * MARKET OPPORTUNITY ENGINE
 * Version: 2.0.0
 * ============================================================
 *
 * PURPOSE
 * ------------------------------------------------------------
 * Detect high-value maritime market opportunities using:
 *
 * 1. Freight market strength
 * 2. Cargo demand strength
 * 3. Vessel availability
 * 4. Port congestion
 * 5. Market risk
 * 6. Commercial profitability
 *
 * FROZEN MODULE RULE
 * ------------------------------------------------------------
 * Once verified and committed, this module must not be modified
 * unless a verified dependency failure requires a version upgrade.
 * ============================================================
 */

class MarketOpportunityEngine {
    constructor() {
        this.name = "MarketOpportunityEngine";
        this.version = "2.0.0";
        this.status = "ACTIVE";

        this.weights = {
            freightStrength: 0.20,
            cargoDemand: 0.20,
            vesselAvailability: 0.15,
            congestionOpportunity: 0.10,
            marketRisk: 0.15,
            profitability: 0.20
        };
    }

    /**
     * --------------------------------------------------------
     * SAFE NUMBER
     * --------------------------------------------------------
     */

    safeNumber(value, fallback = 0) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return fallback;
        }

        return number;
    }

    /**
     * --------------------------------------------------------
     * NORMALIZE SCORE
     * --------------------------------------------------------
     */

    normalizeScore(value, min = 0, max = 100) {
        const number = this.safeNumber(value);

        if (max <= min) {
            return 0;
        }

        const normalized = ((number - min) / (max - min)) * 100;

        return Math.max(0, Math.min(100, normalized));
    }

    /**
     * --------------------------------------------------------
     * FREIGHT MARKET STRENGTH
     * --------------------------------------------------------
     */

    calculateFreightStrength(market = {}) {
        const freightIndex = this.safeNumber(
            market.freightIndex,
            50
        );

        const freightTrend = this.safeNumber(
            market.freightTrend,
            0
        );

        const indexScore = this.normalizeScore(
            freightIndex,
            0,
            100
        );

        const trendScore = this.normalizeScore(
            freightTrend,
            -20,
            20
        );

        return (
            indexScore * 0.70 +
            trendScore * 0.30
        );
    }

    /**
     * --------------------------------------------------------
     * CARGO DEMAND STRENGTH
     * --------------------------------------------------------
     */

    calculateCargoDemand(cargo = {}) {
        const demandIndex = this.safeNumber(
            cargo.demandIndex,
            50
        );

        const cargoVolume = this.safeNumber(
            cargo.volume || cargo.quantity,
            0
        );

        const demandScore = this.normalizeScore(
            demandIndex,
            0,
            100
        );

        const volumeScore = this.normalizeScore(
            cargoVolume,
            0,
            100000
        );

        return (
            demandScore * 0.70 +
            volumeScore * 0.30
        );
    }

    /**
     * --------------------------------------------------------
     * VESSEL AVAILABILITY
     * --------------------------------------------------------
     */

    calculateVesselAvailability(vessel = {}) {
        const availabilityIndex = this.safeNumber(
            vessel.availabilityIndex,
            50
        );

        const utilization = this.safeNumber(
            vessel.utilization,
            50
        );

        const availabilityScore = this.normalizeScore(
            availabilityIndex,
            0,
            100
        );

        const utilizationOpportunity =
            100 -
            this.normalizeScore(
                utilization,
                0,
                100
            );

        return (
            availabilityScore * 0.60 +
            utilizationOpportunity * 0.40
        );
    }

    /**
     * --------------------------------------------------------
     * PORT CONGESTION OPPORTUNITY
     * --------------------------------------------------------
     */

    calculateCongestionOpportunity(port = {}) {
        const congestionIndex = this.safeNumber(
            port.congestionIndex,
            50
        );

        const waitingTime = this.safeNumber(
            port.waitingTime,
            0
        );

        const congestionScore =
            100 -
            this.normalizeScore(
                congestionIndex,
                0,
                100
            );

        const waitingScore =
            100 -
            this.normalizeScore(
                waitingTime,
                0,
                10
            );

        return (
            congestionScore * 0.60 +
            waitingScore * 0.40
        );
    }

    /**
     * --------------------------------------------------------
     * MARKET RISK SCORE
     * --------------------------------------------------------
     */

    calculateMarketRisk(risk = {}) {
        const volatility = this.safeNumber(
            risk.volatility,
            50
        );

        const geopoliticalRisk = this.safeNumber(
            risk.geopoliticalRisk,
            50
        );

        const operationalRisk = this.safeNumber(
            risk.operationalRisk,
            50
        );

        const averageRisk =
            (
                volatility +
                geopoliticalRisk +
                operationalRisk
            ) / 3;

        return (
            100 -
            this.normalizeScore(
                averageRisk,
                0,
                100
            )
        );
    }

    /**
     * --------------------------------------------------------
     * PROFITABILITY SCORE
     * --------------------------------------------------------
     */

    calculateProfitability(commercial = {}) {
        const profit = this.safeNumber(
            commercial.profit,
            0
        );

        const tce = this.safeNumber(
            commercial.tce,
            0
        );

        const margin = this.safeNumber(
            commercial.margin,
            0
        );

        const profitScore = this.normalizeScore(
            profit,
            -100000,
            500000
        );

        const tceScore = this.normalizeScore(
            tce,
            0,
            100000
        );

        const marginScore = this.normalizeScore(
            margin,
            -20,
            50
        );

        return (
            profitScore * 0.40 +
            tceScore * 0.35 +
            marginScore * 0.25
        );
    }

    /**
     * --------------------------------------------------------
     * OPPORTUNITY CLASSIFICATION
     * --------------------------------------------------------
     */

    classifyOpportunity(score) {
        if (score >= 85) {
            return "EXCEPTIONAL";
        }

        if (score >= 70) {
            return "HIGH";
        }

        if (score >= 55) {
            return "MODERATE";
        }

        if (score >= 40) {
            return "LOW";
        }

        return "WEAK";
    }

    /**
     * --------------------------------------------------------
     * COMMERCIAL ACTION
     * --------------------------------------------------------
     */

    generateAction(classification) {
        switch (classification) {
            case "EXCEPTIONAL":
                return "IMMEDIATE COMMERCIAL ACTION";

            case "HIGH":
                return "PRIORITIZE OPPORTUNITY";

            case "MODERATE":
                return "MONITOR AND EVALUATE";

            case "LOW":
                return "LIMITED COMMERCIAL INTEREST";

            default:
                return "AVOID OPPORTUNITY";
        }
    }

    /**
     * --------------------------------------------------------
     * CONFIDENCE SCORE
     * --------------------------------------------------------
     */

    calculateConfidence(input = {}) {
        let availableSignals = 0;

        const totalSignals = 6;

        if (input.market) {
            availableSignals++;
        }

        if (input.cargo) {
            availableSignals++;
        }

        if (input.vessel) {
            availableSignals++;
        }

        if (input.port) {
            availableSignals++;
        }

        if (input.risk) {
            availableSignals++;
        }

        if (input.commercial) {
            availableSignals++;
        }

        return Math.round(
            (availableSignals / totalSignals) * 100
        );
    }

    /**
     * --------------------------------------------------------
     * MARKET OPPORTUNITY ANALYSIS
     * --------------------------------------------------------
     */

    analyze(input = {}) {
        const freightStrength =
            this.calculateFreightStrength(
                input.market
            );

        const cargoDemand =
            this.calculateCargoDemand(
                input.cargo
            );

        const vesselAvailability =
            this.calculateVesselAvailability(
                input.vessel
            );

        const congestionOpportunity =
            this.calculateCongestionOpportunity(
                input.port
            );

        const marketRisk =
            this.calculateMarketRisk(
                input.risk
            );

        const profitability =
            this.calculateProfitability(
                input.commercial
            );

        const opportunityScore =
            freightStrength *
                this.weights.freightStrength +

            cargoDemand *
                this.weights.cargoDemand +

            vesselAvailability *
                this.weights.vesselAvailability +

            congestionOpportunity *
                this.weights.congestionOpportunity +

            marketRisk *
                this.weights.marketRisk +

            profitability *
                this.weights.profitability;

        const finalScore = Number(
            opportunityScore.toFixed(2)
        );

        const classification =
            this.classifyOpportunity(
                finalScore
            );

        const action =
            this.generateAction(
                classification
            );

        const confidence =
            this.calculateConfidence(
                input
            );

        return {
            engine: this.name,
            version: this.version,
            status: this.status,

            opportunityScore: finalScore,

            classification,

            action,

            confidence,

            intelligence: {
                freightStrength: Number(
                    freightStrength.toFixed(2)
                ),

                cargoDemand: Number(
                    cargoDemand.toFixed(2)
                ),

                vesselAvailability: Number(
                    vesselAvailability.toFixed(2)
                ),

                congestionOpportunity: Number(
                    congestionOpportunity.toFixed(2)
                ),

                marketRisk: Number(
                    marketRisk.toFixed(2)
                ),

                profitability: Number(
                    profitability.toFixed(2)
                )
            },

            generatedAt:
                new Date().toISOString()
        };
    }

    /**
     * --------------------------------------------------------
     * ENGINE INFORMATION
     * --------------------------------------------------------
     */

    getEngineInfo() {
        return {
            name: this.name,
            version: this.version,
            status: this.status,
            weights: this.weights
        };
    }
}

module.exports = new MarketOpportunityEngine();