var dataDefault = {
    timezone : "x",
    current: {
        temp: "--.--",
        humidity: "--",
        wind_speed: "--.--",
        uvi: "-.-",
        weather: [{
            icon: "",
        }]
    },
    daily: [
        {
            temp: {
                day: "--.--",
            },
            humidity: "--",
            weather: [{
                icon: "",
            }]
        },
        {
            temp: {
                day: "--.--",
            },
            humidity: "--",
            weather: [{
                icon: "",
            }]
        },
        {
            temp: {
                day: "--.--",
            },
            humidity: "--",
            weather: [{
                icon: "",
            }]
        },
        {
            temp: {
                day: "--.--",
            },
            humidity: "--",
            weather: [{
                icon: "",
            }]
        },
        {
            temp: {
                day: "--.--",
            },
            humidity: "--",
            weather: [{
                icon: "",
            }]
        }
    ]
};
var current = {};
var cityName = "City Name";
var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
if (searchHistory === null || searchHistory.length === 0) {
    searchHistory = [];
    loadData(dataDefault);
} else if (searchHistory.length != 0){
    cityName = searchHistory[0];
    fetchWeatherData(cityName);
    for (var i = 0; i < searchHistory.length; i++) {
        var searchHistoryEl = $("<div>");
        var searchHistoryTextEl = $("<div>").text(searchHistory[i]);
        var deleteButton = $("<button>").text("X");
        searchHistoryEl.addClass("search-history d-flex");
        searchHistoryTextEl.addClass("search-history-text");
        deleteButton.addClass("btn delete-button");
        $(".search-history-box").append(searchHistoryEl);
        searchHistoryEl.append(searchHistoryTextEl, deleteButton);
    }
}

function searchButtonClickHandler() {
    cityName = $("#search-input").val().replace(/\s+/g, ' ').trim();
    var words = cityName.split(" ");
    $("#search-input").val("");
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    cityName = words.join(" ");
    updateSearchHistory(cityName);
    fetchWeatherData(cityName);
}

function updateSearchHistory(cityToAdd) {
    console.log(cityToAdd);
    console.log($(".search-history-text"));
    $(".search-history-text").each(function(i) {
        if ($(this).text() === cityToAdd) {
            console.log($(this).text());
            $(this).parent().remove();
            searchHistory.splice(i, 1);
            console.log("delete");
            return false;
        }
        else {
            console.log($(this).text());
            console.log("keep");
        }
    });
    var searchHistoryEl = $("<div>");
    var searchHistoryTextEl = $("<div>").text(cityToAdd);
    var deleteButton = $("<button>").text("X");
    searchHistoryEl.addClass("search-history d-flex");
    searchHistoryTextEl.addClass("search-history-text");
    deleteButton.addClass("btn delete-button");
    $(".search-history-box").prepend(searchHistoryEl);
    searchHistoryEl.append(searchHistoryTextEl, deleteButton);
    searchHistory.unshift(cityToAdd);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));    
}

function fetchWeatherData(cityName) {
    var requestUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=7c84bd2799ba53ed40763cdc11025a8e";
    $(".weather-current").empty();
    $(".weather-forecast-card").empty();
    fetch(requestUrl)
    .then(function(response) {
        if (response.status === 200) {
            return response.json();
        } else if (response.status === 404) {
            loadData(dataDefault);
            $(document).ready(function(){
                alert("Sorry we cannot find weather data of this city!");
            });   
        }
    })
    .then(function(data) {
        if (data === undefined) {
            return;
        }
        current.lon = data.coord.lon;
        current.lat = data.coord.lat;
        requestUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + current.lat + "&lon=" + current.lon + "&exclude=minutely,hourly&units=imperial&appid=7c84bd2799ba53ed40763cdc11025a8e";
        fetch(requestUrl)
        .then(function(response) {
            if (response.status === 200) {
                return response.json();
            } else {
                loadData(dataDefault);
                $(document).ready(function(){
                    alert("Sorry we cannot find weather data of this city!");
                });
            }
        })
        .then(function(data) {
            if (data === undefined) {
                return;
            }
            loadData(data);
        })
    })
}

function loadData(data) {
    var mainInfoEl = $("<h2>");
    var tempEl = $("<div>");
    var humidityEl = $("<div>");
    var windEl = $("<div>");
    var uvIndexEl = $("<div>");
    var uvIndexNum = $("<span>");
    var imgEl = $("<img>");
    var momentTime = data.timezone === "x"  ? moment() 
                                            : moment.unix((moment().valueOf())/1000 + data.timezone_offset);
    current.temp = data.current.temp;
    current.humidity = data.current.humidity;
    current.windSpeed = data.current.wind_speed;
    current.uvIndex = data.current.uvi;
    // current.weather = data.current.weather[0].main;
    current.weatherIcon = data.current.weather[0].icon;
    mainInfoEl.text(cityName + " " + momentTime.format("l"));
    tempEl.html("Temperature: " + current.temp + " &#8457");
    humidityEl.text("Humidity: " + current.humidity + "%");
    windEl.text("Wind Speed: " + current.windSpeed + " MPH");
    uvIndexEl.text("UV Index: ");
    uvIndexNum.text(data.current.uvi);
    uvIndexNum.addClass("uvindex-num");
    uvIndexEl.append(uvIndexNum);
    if (data.current.uvi <= 2) {
        uvIndexNum.css("background-color", "green");
    } else if (data.current.uvi <= 5) {
        uvIndexNum.css("background-color", "yellow");
    } else if (data.current.uvi <= 7) {
        uvIndexNum.css("background-color", "orange");
    } else if (data.current.uvi <= 10) {
        uvIndexNum.css("background-color", "red");
    } else if (typeof data.current.uvi === "number") {
        uvIndexNum.css("background-color", "violet");
    }
    if (current.weatherIcon !== "") {
        imgEl.attr("src", "https://openweathermap.org/img/wn/" + current.weatherIcon + ".png");
    }
    mainInfoEl.append(imgEl);
    $(".weather-current").append(mainInfoEl, tempEl, humidityEl, windEl, uvIndexEl);
    $(".weather-forecast-card").each(function (i) {
        var forecastDateEl = $("<h4>");
        var forecastTempEl = $("<div>");
        var forecastHumidityEl = $("<div>");
        var forecastWeatherEl = $("<div>");
        var forecastImgEl = $("<img>");
        forecastDateEl.text(momentTime.add(1, "days").format('l'));
        forecastTempEl.html("Temp: " + data.daily[i].temp.day + " &#8457");
        forecastHumidityEl.text("Humidity: " + data.daily[i].humidity + "%");
        if (data.daily[i].weather[0].icon !== "") {
            forecastImgEl.attr("src", "https://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + ".png");
        }
        forecastWeatherEl.append(forecastImgEl);
        $(this).append(forecastDateEl, forecastWeatherEl, forecastTempEl, forecastHumidityEl);
    })
}

function removeDuplicate (citySearched) {
    return citySearched != cityName;
}

$("#search-button").on("click", searchButtonClickHandler);
$(".search-container").on('click', '.search-history-text', function (event) {
    cityName = $(event.target).text();
    fetchWeatherData(cityName);
    updateSearchHistory(cityName);
});
$(".search-container").on('click', '.delete-button', function (event) {
    cityName = $(event.target).prev().text();
    $(event.target).parent().remove();
    searchHistory = searchHistory.filter(removeDuplicate);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));  
    // if (searchHistory.length === 0) {
    //     loadData(dataDefault);
    // }  
});


