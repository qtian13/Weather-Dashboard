// when no data found from the third applicationCache, display default data for place holder
var dataDefault = {
    timezone: "x",
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
var cityName = "City Name";
// get object of search history array from Local Storage
var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));

// load the page
function loadPage() {
    // if search history is empty, display the place holder object
    if (searchHistory === null || searchHistory.length === 0) {
        searchHistory = [];
        displayData(dataDefault);
    // if not, display the weather data of the most recently searched city
    } else if (searchHistory.length != 0){
        cityName = searchHistory[0];
        fetchWeatherData(cityName);
        for (var i = 0; i < searchHistory.length; i++) {
            var searchHistoryEl = $("<div>");
            var searchHistoryTextEl = $("<div>").text(searchHistory[i]);
            var deleteButton = $("<button>").text("x");
            searchHistoryEl.addClass("search-history d-flex");
            searchHistoryTextEl.addClass("search-history-text");
            deleteButton.addClass("btn delete-button");
            $(".search-history-box").append(searchHistoryEl);
            searchHistoryEl.append(searchHistoryTextEl, deleteButton);
        }
    }
}

// run this function when search button is clicked
function searchButtonClickHandler() {
    // remove extra space in the input area and set each works starts with upper case letters
    cityName = $("#search-input").val().replace(/\s+/g, ' ').trim();
    var words = cityName.split(" ");
    $("#search-input").val("");

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }

    cityName = words.join(" ");
    // add the input to search history
    updateSearchHistory(cityName);
    // fetch data from the third application via API
    fetchWeatherData(cityName);
}

// add the parameter to search history
function updateSearchHistory(cityToAdd) {
    // declare a flag indicating if the cityToAdd already in the search history
    var added = false;
    // check if the city name is already in the search history
    $(".search-history-text").each(function(i) {
        if ($(this).text() === cityToAdd) {
            // if so, prepend it to an element of class named search-history-box
            $(this).parent().prependTo($(".search-history-box"));
            // remove it from the searchHisotry object
            searchHistory.splice(i, 1);
            // set flag as true
            added = true;
            return false;
        }
    });

    if (!added) {
        // if not, create the element and prepend it to an element of class named search-history-box
        var searchHistoryEl = $("<div>");
        var searchHistoryTextEl = $("<div>").text(cityToAdd);
        var deleteButton = $("<button>").text("x");
        searchHistoryEl.addClass("search-history d-flex");
        searchHistoryTextEl.addClass("search-history-text");
        deleteButton.addClass("btn delete-button");
        $(".search-history-box").prepend(searchHistoryEl);
        searchHistoryEl.append(searchHistoryTextEl, deleteButton);
    }

    // add the city name to searchHistory object and saved to Local Storage
    searchHistory.unshift(cityToAdd);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));  
}

function fetchWeatherData(city) {
    // create a request url
    var APIKey = "7c84bd2799ba53ed40763cdc11025a8e";
    var requestUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;
    
    // empty the dashboard
    $(".weather-current").empty();
    $(".weather-forecast-card").empty();
    fetch(requestUrl)
    .then(function(response) {
        if (response.status === 200) {
            return response.json();
        } else if (response.status === 404) {
            // if no data returned for the city searched for, display place holder Object
            cityName = city + " (not found)";
            displayData(dataDefault); 
        }
    })
    .then(function(data) {
        if (data === undefined) {
            return;
        }
        requestUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + data.coord.lat + "&lon=" + data.coord.lon + "&exclude=minutely,hourly&units=imperial&appid=" + APIKey;
        fetch(requestUrl)
        .then(function(response) {
            if (response.status === 200) {
                return response.json();
            } else {
                cityName = city + " (not found)";
                displayData(dataDefault);
            }
        })
        .then(function(data) {
            if (data === undefined) {
                return;
            }
            displayData(data);
        })
    })
}

// display data info in the dashboard
function displayData(data) {
    // create elements to add to the dashboard
    var mainInfoEl = $("<h2>");
    var tempEl = $("<div>");
    var humidityEl = $("<div>");
    var windEl = $("<div>");
    var uvIndexEl = $("<div>");
    var uvIndexNum = $("<span>");
    var imgEl = $("<img>");
    // calc the local time of the city searched for
    var momentTime = data.timezone === "x"  ? moment() 
                                            : moment().utcOffset(data.timezone_offset / 60);
    // change the background image and font color in jumbotron
    if (data.timezone === "x" || (((data.current.dt + data.timezone_offset) >= data.current.sunrise) && ((data.current.dt + data.timezone_offset) < data.current.sunset))) {
        $("html").css("background-image", "url('assets/images/background.jpeg')");
        $(".jumbotron").css("color", "rgba(27, 28, 29, 0.9)");
    } else {
        $("html").css("background-image", "url('assets/images/background_night.jpeg')");
        $(".jumbotron").css("color", "rgba(243, 245, 247, 0.7)");
    }
    // set text content according to data info
    mainInfoEl.text(cityName + " " + momentTime.format("l"));
    tempEl.html("Temperature: " + data.current.temp + " &#8457");
    humidityEl.text("Humidity: " + data.current.humidity + "%");
    windEl.text("Wind Speed: " + data.current.wind_speed + " MPH");
    uvIndexEl.text("UV Index: ");
    uvIndexNum.text(data.current.uvi);
    uvIndexNum.addClass("uvindex-num");
    uvIndexEl.append(uvIndexNum);
    // set background color according to the uvi scale
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
    if (data.current.weather[0].icon !== "") {
        imgEl.attr("src", "https://openweathermap.org/img/wn/" + data.current.weather[0].icon + ".png");
    }
    mainInfoEl.append(imgEl);
    // append these element to weather-current block
    $(".weather-current").append(mainInfoEl, tempEl, humidityEl, windEl, uvIndexEl);
    // create elements and append to 5-day forecast weather
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

// filter for array to remove duplicated data
function removeDuplicate (citySearched) {
    return citySearched != cityName;
}

loadPage();

$("#search-button").on("click", searchButtonClickHandler);

$(".search-container").on('click', '.search-history-text', function (event) {
    // read the search history text to cityName
    cityName = $(event.target).text();
    // ask for data of the cityName and display the result on the dashboard
    fetchWeatherData(cityName);
    // add cityName to the searchHistory
    updateSearchHistory(cityName);
});

// delete search history item when click delete-button
$(".search-container").on('click', '.delete-button', function (event) {
    cityName = $(event.target).prev().text();
    // delete from the page
    $(event.target).parent().remove();
    // delete from the searchHistory Object
    searchHistory = searchHistory.filter(removeDuplicate);
    // save the searchHistory to Local Storage
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));  
});

// on smaller screen size device like tablet and mobile, display search history block only when search-input is focused
$("#search-input").on("focus", function() {
    if ($(window).width() < 992) {
        $(".search-history-box").css("display", "block");
    }
})

// on smaller screen size device like tablet and mobile, hide search history block when search-container is no longer focused
$(".search-container").on("focusout", function() {
    $(document).ready(function() {
        if ($(window).width() < 992) {
            $(".search-history-box").css("display", "none");
        }
    });
})

// check the screen size when it changes, hide search history block when smaller than 992 px and display when no smaller than 992 px
$(window).resize(function() {
    if ($(window).width() >= 992) {
        $(".search-history-box").css("display", "block");
    } else {
        $(".search-history-box").css("display", "none");
    }
});



