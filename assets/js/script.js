var current = {};


function clickHandler(event) {
    var cityName = $("#search-input").val().trim();
    var longitude;
    var lattitude;
    var tempCur;
    var humidityCur;
    var windSpeed;
    var uvIndex;
    var requestUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=7c84bd2799ba53ed40763cdc11025a8e";
    $(".weather-current").empty();
    fetch(requestUrl)
    .then(function(response) {
        if (response.status === 200) {
            return response.json();
        } else if (response.status === 404) {
            alert("Please enter a valid city name. Be careful of the space!")
        }
    })
    .then(function(data) {
        if (!data) {
            return;
        }
        current.lon = data.coord.lon;
        current.lat = data.coord.lat;
        requestUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + current.lat + "&lon=" + current.lon + "&exclude=minutely,hourly&appid=7c84bd2799ba53ed40763cdc11025a8e";
        fetch(requestUrl)
        .then(function(response) {
            if (response.status === 200) {
                return response.json();
            }
        })
        .then(function(data) {
            var mainInfoEl = $("<h2>");
            var tempEl = $("<div>");
            var humidityEl = $("<div>");
            var windEl = $("<div>");
            var uvIndexEl = $("<div>");
            var imgEl = $("<img>");
            current.temp = data.current.temp;
            current.humidity = data.current.humidity;
            current.windSpeed = data.current.wind_speed;
            current.uvIndex = data.current.uvi;
            current.weather = data.current.weather[0].main;
            current.weatherIcon = data.current.weather[0].icon;
            mainInfoEl.text(cityName + " " + moment().format("l"));
            tempEl.text("Temperature: " + current.temp);
            humidityEl.text("Humidity: " + current.humidity);
            windEl.text("Wind Speed: " + current.windSpeed);
            uvIndexEl.text("UV Index: " + current.uvIndex);
            imgEl.attr("src", "https://openweathermap.org/img/wn/" + current.weatherIcon + ".png");
            mainInfoEl.append(imgEl);
            $(".weather-current").append(mainInfoEl, tempEl, humidityEl, windEl, uvIndexEl);
            $(".weather-forecast-card").each(function(i) {
                var forecastDateEl = $("<h3>");
                var forecastTempEl = $("<div>");
                var forecastHumidityEl = $("<div>");
                var forecastWeatherEl = $("<div>");
                var forecastImgEl = $("<img>");
                forecastDateEl.text(moment().add(i + 1, "days").format('L'));
                forecastTempEl.text("Temperature: " + data.daily[i].temp.day);
                forecastHumidityEl.text("Humidity: " + data.daily[i].humidity);
                forecastImgEl.attr("src", "https://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + ".png");
                forecastWeatherEl.append(forecastImgEl);
                $(this).append(forecastDateEl, forecastWeatherEl, forecastTempEl, forecastHumidityEl);
            })
        })
    })
}

$("#search-button").on("click", clickHandler);
