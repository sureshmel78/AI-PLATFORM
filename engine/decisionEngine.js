/**
 * ============================================================
 * AI-PLATFORM
 * ENTERPRISE DECISION ENGINE
 * Version : 1.0.0
 * ============================================================
 *
 * PURPOSE
 * ------------------------------------------------------------
 * Central commercial decision engine.
 *
 * Aggregates intelligence from multiple engines and converts
 * them into a single commercial recommendation.
 *
 * Part 1
 * ------------------------------------------------------------
 * ✓ Core Engine
 * ✓ Scoring Framework
 * ✓ Safe Helpers
 * ✓ Decision Skeleton
 * ✓ Confidence Calculation
 *
 * (Part 2 will add recommendations, explanations,
 * strategy generation and final outputs.)
 * ============================================================
 */

class DecisionEngine {

    constructor() {

        this.name = "DecisionEngine";
        this.version = "1.0.0";
        this.status = "ACTIVE";

        this.weights = {

            profitability : 0.25,
            market         : 0.20,
            risk           : 0.20,
            congestion     : 0.10,
            freight        : 0.10,
            vessel         : 0.10,
            strategy       : 0.05

        };

    }

    /* ===================================================== */

    safeNumber(value, fallback = 0) {

        const n = Number(value);

        if (!Number.isFinite(n))
            return fallback;

        return n;

    }

    clamp(value, min = 0, max = 100) {

        return Math.max(min, Math.min(max, value));

    }

    weighted(value, weight) {

        return this.safeNumber(value) * weight;

    }

    /* ===================================================== */

    calculateConfidence(scores) {

        const values = Object.values(scores)
            .map(v => this.safeNumber(v))
            .filter(v => v > 0);

        if (!values.length)
            return 0;

        const average =
            values.reduce((a, b) => a + b, 0) / values.length;

        return Math.round(this.clamp(average));

    }

    /* ===================================================== */

    calculateDecisionScore(input = {}) {

        const profitability =
            this.safeNumber(input.profitabilityScore);

        const market =
            this.safeNumber(input.marketScore);

        const risk =
            this.safeNumber(input.riskScore);

        const congestion =
            this.safeNumber(input.congestionScore);

        const freight =
            this.safeNumber(input.freightScore);

        const vessel =
            this.safeNumber(input.vesselScore);

        const strategy =
            this.safeNumber(input.strategyScore);

        const total =

            this.weighted(profitability, this.weights.profitability) +
            this.weighted(market, this.weights.market) +
            this.weighted(risk, this.weights.risk) +
            this.weighted(congestion, this.weights.congestion) +
            this.weighted(freight, this.weights.freight) +
            this.weighted(vessel, this.weights.vessel) +
            this.weighted(strategy, this.weights.strategy);

        return Math.round(this.clamp(total));

    }

    /* ===================================================== */

    classify(score) {

        if (score >= 85)
            return "EXECUTE";

        if (score >= 70)
            return "STRONGLY_RECOMMENDED";

        if (score >= 55)
            return "REVIEW";

        if (score >= 40)
            return "CAUTION";

        return "REJECT";

    }

    /* ===================================================== */

    evaluate(input = {}) {

        const score =
            this.calculateDecisionScore(input);

        const confidence =
            this.calculateConfidence({

                profitability : input.profitabilityScore,
                market         : input.marketScore,
                risk           : input.riskScore,
                congestion     : input.congestionScore,
                freight        : input.freightScore,
                vessel         : input.vesselScore,
                strategy       : input.strategyScore

            });

        return {

            engine : this.name,

            version : this.version,

            status : this.status,

            score,

            confidence,

            decision :

                this.classify(score)

        };

    }

}

module.exports = new DecisionEngine();