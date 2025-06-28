const VC_API_KEY = "8WHFUGV7QVK48L8S39BDXZ26Y";
const GIPHY_KEY = "7hOvll3XDu1kqUu93k0dUM5O8IHoZaXN";

const locationInput = document.getElementById("location-input");
const unitToggle = document.getElementById("unit-toggle");
const getWeatherBtn = document.getElementById("get-weather-btn");
const forecastContainer = document.getElementById("forecast");
const locationTitle = document.getElementById("location-title");

async function fetchWeather(location, unitGroup) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
    location
  )}?unitGroup=${unitGroup}&key=${VC_API_KEY}&contentType=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Location not found");
  return response.json();
}

async function fetchGif(condition) {
  const url = `https://api.giphy.com/v1/gifs/translate?api_key=${GIPHY_KEY}&s=${encodeURIComponent(
    condition
  )} weather`;
  const response = await fetch(url);
  const data = await response.json();
  return data.data?.images?.fixed_height_small?.url || "";
}

function updateBackground(temp, unit) {
  let tempF = unit === "us" ? temp : (temp * 9) / 5 + 32;
  if (tempF < 40) {
    document.body.style.background = "#004e92"; // cold - blue
  } else if (tempF < 70) {
    document.body.style.background = "#56CCF2"; // mild - light blue
  } else if (tempF < 90) {
    document.body.style.background = "#F2994A"; // warm - orange
  } else {
    document.body.style.background = "#EB5757"; // hot - red
  }
}

async function displayForecast() {
  const location = locationInput.value.trim();
  const unit = unitToggle.value;

  if (!location) {
    alert("Please enter a location.");
    return;
  }

  try {
    const weatherData = await fetchWeather(location, unit);
    const days = weatherData.days.slice(0, 7); // 7-day forecast
    forecastContainer.innerHTML = "";
    locationTitle.textContent = weatherData.resolvedAddress;

    // Set background based on today's temp
    updateBackground(days[0].temp, unit);

    for (let day of days) {
      const card = document.createElement("div");
      card.className = "day-card";

      const date = new Date(day.datetime).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const condition = day.conditions;
      const tempHigh = day.tempmax;
      const tempLow = day.tempmin;

      let gifUrl = "";
      try {
        gifUrl = await fetchGif(condition);
      } catch (err) {
        gifUrl = "";
      }

      card.innerHTML = `
            <h3>${date}</h3>
            <p>${condition}</p>
            <p>High: ${tempHigh}°</p>
            <p>Low: ${tempLow}°</p>
            ${gifUrl ? `<img src="${gifUrl}" alt="${condition}">` : ""}
          `;

      forecastContainer.appendChild(card);
    }
  } catch (err) {
    forecastContainer.innerHTML = "";
    locationTitle.textContent = "";
    alert("Failed to load weather data.");
    console.error(err);
  }
}

getWeatherBtn.addEventListener("click", displayForecast);
locationInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") displayForecast();
});

window.addEventListener("load", () => {
  locationInput.value = "New York";
  displayForecast();
});
