const vesselIntelligence =
require('./vesselIntelligence');

const riskEngine =
require('./riskEngine');

class VesselRiskEngine {

generateRiskAssessment(){

const vessel={

name:'MSC MARINA',

currentPosition:{
lat:8.8,
lon:78.1
},

speed:14,

fuelRemaining:400,

fuelConsumptionPerDay:60

};

const destination={

name:'Singapore',

lat:1.290270,
lon:103.851959

};

const weatherData={

windSpeed:32,

waveHeight:4.5,

visibility:5

};

const etaAnalysis=

vesselIntelligence
.calculateETA(
vessel,
destination
);

const weatherAnalysis=

vesselIntelligence
.calculateWeatherImpact(
weatherData
);

const fuelAnalysis=

vesselIntelligence
.calculateFuelRisk(
vessel
);

const voyageRisk=

riskEngine
.calculateVoyageRisk({

weatherRisk:
weatherAnalysis.riskLevel,

fuelRisk:
fuelAnalysis.riskLevel,

congestionRisk:
'LOW',

routeDeviation:
false

});

return{

vessel:
vessel.name,

etaAnalysis,

weatherAnalysis,

fuelAnalysis,

voyageRisk,

generatedAt:
new Date()
.toISOString()

};

}

}

module.exports =
new VesselRiskEngine();