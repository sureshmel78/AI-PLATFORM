/*
===============================================================
Enterprise Maritime AI Intelligence Platform
Weather Intelligence Provider
Version : 3.0.0
===============================================================
*/

class WeatherProvider {
    constructor() {
        this.name = "WeatherIntelligenceProvider";
        this.version = "3.0.0";
        this.providerName = "OPEN_METEO";
        this.weatherURL = process.env.WEATHER_API_URL || "https://api.open-meteo.com/v1/forecast";
        this.marineURL = process.env.MARINE_API_URL || "https://marine-api.open-meteo.com/v1/marine";
        this.defaultLatitude = Number(process.env.WEATHER_DEFAULT_LATITUDE || 8.7642);
        this.defaultLongitude = Number(process.env.WEATHER_DEFAULT_LONGITUDE || 78.1348);
        this.timeoutMs = Number(process.env.WEATHER_API_TIMEOUT_MS || 8000);
        this.apiEnabled = process.env.WEATHER_API_ENABLED !== "false";
    }

    safeNumber(value, fallback = 0) {
        const number = Number(value);
        return Number.isFinite(number) ? number : fallback;
    }

    validateCoordinates(latitude, longitude) {
        const lat = Number(latitude);
        const lon = Number(longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            throw new Error("Invalid weather coordinates.");
        }
        return { lat, lon };
    }

    async fetchJSON(url) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error(`Weather API HTTP ${response.status}`);
            return await response.json();
        } finally {
            clearTimeout(timer);
        }
    }

    calculateWeatherRisk(windSpeed, windGusts, weatherCode, waveHeight = 0, visibility = 10) {
        const wind = this.safeNumber(windSpeed);
        const gust = this.safeNumber(windGusts);
        const code = this.safeNumber(weatherCode);
        const wave = this.safeNumber(waveHeight);
        const vis = this.safeNumber(visibility, 10);
        if (wind >= 50 || gust >= 70 || wave > 6 || vis < 1 || [95, 96, 99].includes(code)) return "HIGH";
        if (wind >= 30 || gust >= 45 || wave > 3 || vis < 2 || [65, 67, 80, 81, 82].includes(code)) return "MEDIUM";
        return "LOW";
    }

    async fetchLiveWeather(latitude, longitude) {
        const { lat, lon } = this.validateCoordinates(latitude, longitude);
        const weatherUrl = `${this.weatherURL}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,wind_speed_10m,wind_gusts_10m,weather_code&hourly=visibility&forecast_days=1&timezone=UTC`;
        const marineUrl = `${this.marineURL}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=wave_height&timezone=UTC`;
        const [weatherResult, marineResult] = await Promise.allSettled([
            this.fetchJSON(weatherUrl),
            this.fetchJSON(marineUrl)
        ]);
        if (weatherResult.status !== "fulfilled") throw weatherResult.reason;
        const data = weatherResult.value || {};
        const current = data.current || {};
        const marine = marineResult.status === "fulfilled" ? (marineResult.value || {}) : {};
        const temperature = this.safeNumber(current.temperature_2m);
        const windSpeed = this.safeNumber(current.wind_speed_10m);
        const windGusts = this.safeNumber(current.wind_gusts_10m);
        const weatherCode = this.safeNumber(current.weather_code);
        const waveHeight = this.safeNumber(marine.current?.wave_height);
        const visibilityMetres = this.safeNumber(data.hourly?.visibility?.[0], 10000);
        const visibility = Number((visibilityMetres / 1000).toFixed(2));
        const riskLevel = this.calculateWeatherRisk(windSpeed, windGusts, weatherCode, waveHeight, visibility);
        return {
            latitude: this.safeNumber(data.latitude, lat), longitude: this.safeNumber(data.longitude, lon),
            temperature, temperature_2m: temperature,
            windspeed: windSpeed, windSpeed, wind_speed_10m: windSpeed,
            windGusts, wind_gusts_10m: windGusts,
            weathercode: weatherCode, weatherCode, weather_code: weatherCode,
            waveHeight, visibility, risk: riskLevel, riskLevel,
            provider: this.providerName, sourceType: "LIVE_API", isLive: true,
            timestamp: current.time || new Date().toISOString(), status: "LIVE_DATA"
        };
    }

    getFallbackWeather(latitude = this.defaultLatitude, longitude = this.defaultLongitude) {
        const lat = this.safeNumber(latitude, this.defaultLatitude);
        const lon = this.safeNumber(longitude, this.defaultLongitude);
        return {
            latitude: lat, longitude: lon,
            temperature: 28, temperature_2m: 28,
            windspeed: 15, windSpeed: 15, wind_speed_10m: 15,
            windGusts: 20, wind_gusts_10m: 20,
            weathercode: 0, weatherCode: 0, weather_code: 0,
            waveHeight: 1.2, visibility: 10,
            risk: "LOW", riskLevel: "LOW",
            provider: "WEATHER_FALLBACK", sourceType: "BENCHMARK_PROFILE", isLive: false,
            timestamp: new Date().toISOString(), status: "FALLBACK_DATA"
        };
    }

    async getWeather(latitude = this.defaultLatitude, longitude = this.defaultLongitude) {
        if (!this.apiEnabled) return this.getFallbackWeather(latitude, longitude);
        try { return await this.fetchLiveWeather(latitude, longitude); }
        catch (error) { return { ...this.getFallbackWeather(latitude, longitude), fallbackReason: error.message }; }
    }

    async getCurrentWeather(latitude = this.defaultLatitude, longitude = this.defaultLongitude) { return this.getWeather(latitude, longitude); }
    async getWeatherData(latitude = this.defaultLatitude, longitude = this.defaultLongitude) { return this.getWeather(latitude, longitude); }

    getStatus() {
        return { name: this.name, version: this.version, provider: this.providerName, apiEnabled: this.apiEnabled, mode: this.apiEnabled ? "LIVE_WITH_FALLBACK" : "FALLBACK", status: "WEATHER_PROVIDER_ACTIVE" };
    }
}

module.exports = new WeatherProvider();
