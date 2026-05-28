class WeatherProvider{

constructor(){

this.provider='OPEN-METEO';

this.latitude=8.7642; // Tuticorin area

this.longitude=78.1348;

}

/*
====================================================
LIVE WEATHER
====================================================
*/

async getWeather(){

try{

return await this.fetchWeatherFeed();

}
catch(error){

console.log(

'Weather Provider Error:',
error.message

);

return this.getFallbackWeather();

}

}

/*
====================================================
REAL WEATHER API
====================================================
*/

async fetchWeatherFeed(){

const url=

`https://api.open-meteo.com/v1/forecast?latitude=${this.latitude}&longitude=${this.longitude}&current=temperature_2m,wind_speed_10m,weather_code`;

const response=
await fetch(url);

if(!response.ok){

throw new Error(
'Weather API unavailable'
);

}

const data=
await response.json();

return{

temperature:
data.current.temperature_2m,

windspeed:
data.current.wind_speed_10m,

weathercode:
data.current.weather_code,

waveHeight:1.8,

visibility:8,

risk:
this.calculateRisk(
data.current.wind_speed_10m
),

provider:
this.provider,

updated:
new Date()
.toISOString()

};

}

/*
====================================================
WEATHER RISK
====================================================
*/

calculateRisk(windspeed){

if(windspeed>40){

return 'HIGH';

}

if(windspeed>25){

return 'MEDIUM';

}

return 'LOW';

}

/*
====================================================
FALLBACK
====================================================
*/

getFallbackWeather(){

return{

temperature:31,

windspeed:18,

weathercode:2,

waveHeight:1.8,

visibility:8,

risk:'LOW',

provider:
'FALLBACK',

updated:
new Date()
.toISOString()

};

}

}

module.exports=
new WeatherProvider();