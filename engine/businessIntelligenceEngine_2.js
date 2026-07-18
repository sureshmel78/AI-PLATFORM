/**
 * ============================================================
 * AI-PLATFORM
 * BUSINESS INTELLIGENCE ENGINE
 * Version: 2.0.0
 * ============================================================
 *
 * PURPOSE
 * ------------------------------------------------------------
 * Integrates enterprise intelligence modules into one
 * executive business intelligence response.
 *
 * CURRENT INTEGRATIONS
 * ------------------------------------------------------------
 * 1. Port Comparison Engine
 * 2. Market Opportunity Engine v2.0.0
 *
 * FROZEN MODULE RULE
 * ------------------------------------------------------------
 * Verified dependency modules must not be modified.
 * Integration compatibility must be handled inside this engine.
 * ============================================================
 */

const portComparisonEngine =
    require("./portComparisonEngine");

const marketOpportunityEngine =
    require("./marketOpportunityEngine");


class BusinessIntelligenceEngine {

    constructor() {

        this.name =
            "BusinessIntelligenceEngine";

        this.version =
            "2.0.0";

        this.status =
            "ACTIVE";

    }


    /**
     * --------------------------------------------------------
     * DEFAULT MARKET INTELLIGENCE INPUT
     * --------------------------------------------------------
     *
     * Used when dashboard or API does not provide live
     * intelligence data.
     *
     * Future live providers can inject real market signals
     * without modifying MarketOpportunityEngine.
     * --------------------------------------------------------
     */

    getDefaultMarketInput() {

        return {

            market: {

                freightIndex: 65,

                freightTrend: 4

            },

            cargo: {

                demandIndex: 70,

                volume: 50000

            },

            vessel: {

                availabilityIndex: 60,

                utilization: 55

            },

            port: {

                congestionIndex: 45,

                waitingTime: 3

            },

            risk: {

                volatility: 40,

                geopoliticalRisk: 35,

                operationalRisk: 30

            },

            commercial: {

                profit: 150000,

                tce: 30000,

                margin: 20

            }

        };

    }


    /**
     * --------------------------------------------------------
     * SAFE PORT COMPARISON
     * --------------------------------------------------------
     */

    generatePortComparison() {

        try {

            if (
                !portComparisonEngine ||
                typeof portComparisonEngine
                    .generateComparison !== "function"
            ) {

                return {

                    ports: [],

                    status:
                        "PORT_COMPARISON_UNAVAILABLE"

                };

            }

            return (
                portComparisonEngine
                    .generateComparison()
            );

        } catch (error) {

            return {

                ports: [],

                status:
                    "PORT_COMPARISON_ERROR",

                error:
                    error.message

            };

        }

    }


    /**
     * --------------------------------------------------------
     * MARKET OPPORTUNITY INTELLIGENCE
     * --------------------------------------------------------
     */

    generateMarketOpportunity(input) {

        const intelligenceInput =

            input &&
            typeof input === "object"

                ? input

                : this.getDefaultMarketInput();


        return (

            marketOpportunityEngine
                .analyze(
                    intelligenceInput
                )

        );

    }


    /**
     * --------------------------------------------------------
     * HIGHEST RISK PORT
     * --------------------------------------------------------
     */

    findHighestRiskPort(
        portComparison
    ) {

        if (
            !portComparison ||
            !Array.isArray(
                portComparison.ports
            )
        ) {

            return "NONE";

        }


        const highestRiskPort =

            portComparison.ports.find(

                port =>
                    port &&
                    port.risk === "HIGH"

            );


        return highestRiskPort

            ? highestRiskPort.port

            : "NONE";

    }


    /**
     * --------------------------------------------------------
     * EXECUTIVE SUMMARY
     * --------------------------------------------------------
     */

    generateExecutiveSummary(
        marketOpportunity,
        portComparison
    ) {

        return {

            opportunityScore:

                marketOpportunity
                    .opportunityScore,

            opportunityClassification:

                marketOpportunity
                    .classification,

            recommendedAction:

                marketOpportunity
                    .action,

            confidence:

                marketOpportunity
                    .confidence,

            highestRiskPort:

                this.findHighestRiskPort(
                    portComparison
                )

        };

    }


    /**
     * --------------------------------------------------------
     * GENERATE BUSINESS INTELLIGENCE
     * --------------------------------------------------------
     */

    generateBusinessIntelligence(
        input = null
    ) {

        const portComparison =

            this.generatePortComparison();


        const marketOpportunity =

            this.generateMarketOpportunity(
                input
            );


        const executiveSummary =

            this.generateExecutiveSummary(

                marketOpportunity,

                portComparison

            );


        return {

            engine:
                this.name,

            version:
                this.version,

            status:
                this.status,

            generatedAt:
                new Date()
                    .toISOString(),

            marketOpportunity,

            portComparison,

            executiveSummary,

            intelligenceStatus:
                "BUSINESS_INTELLIGENCE_GENERATED"

        };

    }


    /**
     * --------------------------------------------------------
     * ENGINE INFORMATION
     * --------------------------------------------------------
     */

    getEngineInfo() {

        return {

            name:
                this.name,

            version:
                this.version,

            status:
                this.status,

            integrations: [

                "PortComparisonEngine",

                "MarketOpportunityEngine v2.0.0"

            ]

        };

    }

}


module.exports =
    new BusinessIntelligenceEngine();