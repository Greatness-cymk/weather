async function getWeather() {

    let city = document.getElementById("cityInput").value;

    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    try {

        // Find the city
        let locationResponse = await fetch(
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) +
            "&count=1&language=en&format=json"
        );

        let locationData = await locationResponse.json();

        if (!locationData.results) {
            alert("City not found.");
            return;
        }

        let location = locationData.results[0];

        let latitude = location.latitude;
        let longitude = location.longitude;

        // Get current weather AND 5-day forecast
        let weatherResponse = await fetch(
            "https://api.open-meteo.com/v1/forecast?" +
            "latitude=" + latitude +
            "&longitude=" + longitude +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code" +
            "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
            "&temperature_unit=celsius" +
            "&wind_speed_unit=kmh" +
            "&forecast_days=5" +
            "&timezone=auto"
        );

        let weatherData = await weatherResponse.json();

        let current = weatherData.current;

        // Current weather
        document.getElementById("city").textContent =
            location.name;

        document.getElementById("temperature").textContent =
            Math.round(current.temperature_2m);

        document.getElementById("humidity").textContent =
            current.relative_humidity_2m + "%";

        document.getElementById("wind").textContent =
            current.wind_speed_10m + " km/h";

        document.getElementById("feels").textContent =
            Math.round(current.apparent_temperature) + "°C";

        let description =
            getWeatherDescription(current.weather_code);

        document.getElementById("description").textContent =
            description.text;

        document.getElementById("weatherIcon").textContent =
            description.icon;


        // Create the 5-day forecast
        let forecastContainer =
            document.getElementById("forecastContainer");

        forecastContainer.innerHTML = "";


        for (let i = 0; i < 5; i++) {

            let date = new Date(
                weatherData.daily.time[i]
            );

            let dayName = date.toLocaleDateString(
                "en-US",
                {
                    weekday: "long"
                }
            );

            let maxTemperature =
                Math.round(
                    weatherData.daily.temperature_2m_max[i]
                );

            let minTemperature =
                Math.round(
                    weatherData.daily.temperature_2m_min[i]
                );

            let forecastWeather =
                getWeatherDescription(
                    weatherData.daily.weather_code[i]
                );


            let forecastCard =
                document.createElement("div");

            forecastCard.className = "forecast-card";

            forecastCard.innerHTML = `
                <p>${dayName}</p>
                <span>${forecastWeather.icon}</span>
                <h3>${maxTemperature}°C</h3>
                <small>${minTemperature}°C</small>
            `;

            forecastContainer.appendChild(
                forecastCard
            );
        }

    } catch (error) {

        console.log(error);

        alert(
            "Something went wrong. Please try again."
        );
    }
}


function getWeatherDescription(code) {

    if (code === 0) {
        return {
            text: "Clear Sky",
            icon: "☀️"
        };
    }

    if (code === 1 || code === 2) {
        return {
            text: "Partly Cloudy",
            icon: "🌤️"
        };
    }

    if (code === 3) {
        return {
            text: "Cloudy",
            icon: "☁️"
        };
    }

    if (code >= 51 && code <= 67) {
        return {
            text: "Rain",
            icon: "🌧️"
        };
    }

    if (code >= 71 && code <= 77) {
        return {
            text: "Snow",
            icon: "❄️"
        };
    }

    if (code >= 80 && code <= 82) {
        return {
            text: "Rain Showers",
            icon: "🌦️"
        };
    }

    if (code >= 95) {
        return {
            text: "Thunderstorm",
            icon: "⛈️"
        };
    }

    return {
        text: "Unknown",
        icon: "🌡️"
    };
}