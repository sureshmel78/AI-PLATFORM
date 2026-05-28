class PredictiveEngine {
    constructor() {
        this.marketHistoryWindow = 30;
    }

    predictFreightTrend(marketData) {
        try {
            const average =
                marketData.reduce((sum, value) => sum + value, 0) /
                marketData.length;

            const latest = marketData[marketData.length - 1];

            let trend = 'STABLE';

            if (latest > average * 1.05) {
                trend = 'BULLISH';
            } else if (latest < average * 0.95) {
                trend = 'BEARISH';
            }

            const confidence = this.calculateConfidence(
                marketData
            );

            return {
                trend,
                latestIndex: latest,
                averageIndex: Number(average.toFixed(2)),
                confidence,
                recommendation:
                    trend === 'BULLISH'
                        ? 'Freight market strengthening'
                        : trend === 'BEARISH'
                        ? 'Freight market weakening'
                        : 'Freight market stable',
                status: 'FREIGHT_FORECAST_GENERATED'
            };

        } catch (error) {
            return {
                error: true,
                message: 'Freight prediction failed',
                details: error.message
            };
        }
    }

    predictPortCongestion(portData) {
        try {
            const vesselQueue = portData.waitingVessels || 0;

            const berthUtilization =
                portData.berthUtilization || 0;

            let congestionLevel = 'LOW';

            if (
                vesselQueue > 20 ||
                berthUtilization > 85
            ) {
                congestionLevel = 'HIGH';
            } else if (
                vesselQueue > 10 ||
                berthUtilization > 65
            ) {
                congestionLevel = 'MEDIUM';
            }

            return {
                port: portData.port,
                waitingVessels: vesselQueue,
                berthUtilization,
                congestionLevel,
                predictedDelayHours:
                    congestionLevel === 'HIGH'
                        ? 24
                        : congestionLevel === 'MEDIUM'
                        ? 12
                        : 3,
                recommendation:
                    congestionLevel === 'HIGH'
                        ? 'Alternative port evaluation recommended'
                        : 'Port operating within acceptable limits',
                status: 'PORT_CONGESTION_FORECAST_GENERATED'
            };

        } catch (error) {
            return {
                error: true,
                message: 'Congestion prediction failed',
                details: error.message
            };
        }
    }

    predictFuelTrend(bunkerPrices) {
        try {
            const latest =
                bunkerPrices[bunkerPrices.length - 1];

            const previous =
                bunkerPrices[bunkerPrices.length - 2];

            const percentageChange =
                ((latest - previous) / previous) * 100;

            let trend = 'STABLE';

            if (percentageChange > 3) {
                trend = 'RISING';
            } else if (percentageChange < -3) {
                trend = 'FALLING';
            }

            return {
                currentPrice: latest,
                previousPrice: previous,
                percentageChange: Number(
                    percentageChange.toFixed(2)
                ),
                trend,
                recommendation:
                    trend === 'RISING'
                        ? 'Consider early bunkering strategy'
                        : trend === 'FALLING'
                        ? 'Monitor for lower bunker opportunities'
                        : 'Bunker market stable',
                status: 'BUNKER_FORECAST_GENERATED'
            };

        } catch (error) {
            return {
                error: true,
                message: 'Fuel trend prediction failed',
                details: error.message
            };
        }
    }

    predictWeatherDisruption(weatherForecast) {
        try {
            let disruptionScore = 0;

            weatherForecast.forEach(day => {
                if (day.windSpeed > 35) {
                    disruptionScore += 25;
                }

                if (day.waveHeight > 5) {
                    disruptionScore += 25;
                }

                if (day.visibility < 2) {
                    disruptionScore += 10;
                }
            });

            let disruptionLevel = 'LOW';

            if (disruptionScore >= 70) {
                disruptionLevel = 'HIGH';
            } else if (disruptionScore >= 40) {
                disruptionLevel = 'MEDIUM';
            }

            return {
                disruptionScore,
                disruptionLevel,
                recommendation:
                    disruptionLevel === 'HIGH'
                        ? 'Voyage disruption risk elevated'
                        : disruptionLevel === 'MEDIUM'
                        ? 'Monitor evolving weather systems'
                        : 'Weather conditions favorable',
                status: 'WEATHER_DISRUPTION_FORECAST_GENERATED'
            };

        } catch (error) {
            return {
                error: true,
                message: 'Weather disruption forecast failed',
                details: error.message
            };
        }
    }

    calculateConfidence(dataset) {
        try {
            if (!dataset.length) {
                return 0;
            }

            const max = Math.max(...dataset);
            const min = Math.min(...dataset);

            const volatility = ((max - min) / max) * 100;

            let confidence = 90 - volatility;

            if (confidence < 50) {
                confidence = 50;
            }

            return Number(confidence.toFixed(2));

        } catch (error) {
            return 50;
        }
    }
}

module.exports = new PredictiveEngine();