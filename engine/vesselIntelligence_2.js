class VesselIntelligence {
    constructor() {
        this.averageSpeed = 14; // knots
    }

    calculateETA(vessel, destination) {
        try {
            const distance = this.calculateDistance(
                vessel.currentPosition.lat,
                vessel.currentPosition.lon,
                destination.lat,
                destination.lon
            );

            const speed = vessel.speed || this.averageSpeed;

            const hoursRemaining = distance / speed;

            const eta = new Date(Date.now() + hoursRemaining * 60 * 60 * 1000);

            return {
                vessel: vessel.name,
                destination: destination.name,
                distanceRemainingNm: Number(distance.toFixed(2)),
                currentSpeed: speed,
                estimatedHoursRemaining: Number(hoursRemaining.toFixed(2)),
                eta: eta.toISOString(),
                status: 'ETA_CALCULATED'
            };

        } catch (error) {
            return {
                error: true,
                message: 'ETA calculation failed',
                details: error.message
            };
        }
    }

    detectRouteDeviation(vessel, plannedRoute) {
        try {
            const current = vessel.currentPosition;

            let nearestPointDistance = Infinity;

            plannedRoute.forEach(point => {
                const distance = this.calculateDistance(
                    current.lat,
                    current.lon,
                    point.lat,
                    point.lon
                );

                if (distance < nearestPointDistance) {
                    nearestPointDistance = distance;
                }
            });

            const deviationThreshold = 25;

            return {
                vessel: vessel.name,
                deviationDistanceNm: Number(nearestPointDistance.toFixed(2)),
                deviated: nearestPointDistance > deviationThreshold,
                severity:
                    nearestPointDistance > 100
                        ? 'HIGH'
                        : nearestPointDistance > 50
                        ? 'MEDIUM'
                        : 'LOW',
                status: 'ROUTE_ANALYZED'
            };

        } catch (error) {
            return {
                error: true,
                message: 'Route deviation analysis failed',
                details: error.message
            };
        }
    }

    calculateWeatherImpact(weatherData) {
        try {
            let riskScore = 0;

            if (weatherData.windSpeed > 35) {
                riskScore += 40;
            } else if (weatherData.windSpeed > 20) {
                riskScore += 20;
            }

            if (weatherData.waveHeight > 6) {
                riskScore += 40;
            } else if (weatherData.waveHeight > 3) {
                riskScore += 20;
            }

            if (weatherData.visibility < 2) {
                riskScore += 20;
            }

            let riskLevel = 'LOW';

            if (riskScore >= 70) {
                riskLevel = 'HIGH';
            } else if (riskScore >= 40) {
                riskLevel = 'MEDIUM';
            }

            return {
                riskScore,
                riskLevel,
                recommendation:
                    riskLevel === 'HIGH'
                        ? 'Route adjustment recommended'
                        : riskLevel === 'MEDIUM'
                        ? 'Monitor conditions closely'
                        : 'Conditions acceptable',
                status: 'WEATHER_ANALYZED'
            };

        } catch (error) {
            return {
                error: true,
                message: 'Weather impact analysis failed',
                details: error.message
            };
        }
    }

    calculateFuelRisk(vessel) {
        try {
            const consumptionRate = vessel.fuelConsumptionPerDay || 35;

            const fuelRemaining = vessel.fuelRemaining || 1000;

            const enduranceDays = fuelRemaining / consumptionRate;

            let riskLevel = 'LOW';

            if (enduranceDays < 5) {
                riskLevel = 'HIGH';
            } else if (enduranceDays < 10) {
                riskLevel = 'MEDIUM';
            }

            return {
                vessel: vessel.name,
                fuelRemaining,
                dailyConsumption: consumptionRate,
                enduranceDays: Number(enduranceDays.toFixed(2)),
                riskLevel,
                recommendation:
                    riskLevel === 'HIGH'
                        ? 'Immediate bunkering planning required'
                        : riskLevel === 'MEDIUM'
                        ? 'Monitor bunker consumption'
                        : 'Fuel status healthy',
                status: 'FUEL_ANALYZED'
            };

        } catch (error) {
            return {
                error: true,
                message: 'Fuel risk calculation failed',
                details: error.message
            };
        }
    }

    generateOperationalRecommendation({
        etaAnalysis,
        weatherAnalysis,
        fuelAnalysis,
        routeAnalysis
    }) {
        try {
            const recommendations = [];

            if (weatherAnalysis.riskLevel === 'HIGH') {
                recommendations.push(
                    'Consider alternate routing due to severe weather'
                );
            }

            if (fuelAnalysis.riskLevel === 'HIGH') {
                recommendations.push(
                    'Immediate bunker replenishment required'
                );
            }

            if (routeAnalysis.deviated) {
                recommendations.push(
                    'Investigate vessel route deviation immediately'
                );
            }

            if (recommendations.length === 0) {
                recommendations.push(
                    'Voyage operating within optimal parameters'
                );
            }

            return {
                vessel: etaAnalysis.vessel,
                recommendations,
                generatedAt: new Date().toISOString(),
                status: 'RECOMMENDATIONS_GENERATED'
            };

        } catch (error) {
            return {
                error: true,
                message: 'Operational recommendation generation failed',
                details: error.message
            };
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const toRadians = degrees => degrees * (Math.PI / 180);

        const earthRadiusNm = 3440.065;

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) *
                Math.cos(toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadiusNm * c;
    }
}

module.exports = new VesselIntelligence();