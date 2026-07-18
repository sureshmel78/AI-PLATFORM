const gateway =
require('../feeds/gateway');

const predictiveEngine =
require('./predictiveEngine');

const riskEngine =
require('./riskEngine');

class CongestionEngine {

async generateCongestionIntelligence(){

const feeds =
await gateway.getEnterpriseFeeds();

const activeVessels =
feeds.ais.activeVessels || 0;

const berthUtilization =
activeVessels > 20
? 90
: activeVessels > 10
? 75
: 50;

const congestionForecast =

predictiveEngine
.predictPortCongestion({

port:'VOC PORT',

waitingVessels:
activeVessels,

berthUtilization

});

const portRisk =

riskEngine
.calculatePortRisk({

congestionLevel:
congestionForecast
.congestionLevel,

weatherImpact:
feeds.weather.risk,

berthDelay:
congestionForecast
.predictedDelayHours

});

return {

port:'VOC PORT',

activeVessels,

weatherRisk:
feeds.weather.risk,

freightSentiment:
feeds.freight.sentiment,

congestionForecast,

portRisk,

generatedAt:
new Date()
.toISOString()

};

}

}

module.exports =
new CongestionEngine();