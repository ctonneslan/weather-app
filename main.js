const VC_API_KEY = "8WHFUGV7QVK48L8S39BDXZ26Y";
const GIPHY_KEY = "7hOvll3XDu1kqUu93k0dUM5O8IHoZaXN";

const locationInput = document.getElementById("location-input");
const unitToggle = document.getElementById("unit-toggle");
const getWeatherBtn = document.getElementById("get-weather-btn");

const locationName = document.getElementById("location-name");
const description = document.getElementById("description");
const temperature = document.getElementById("temperature");
const weatherGif = document.getElementById("weather-gif");

async function fetchWeather(location, unitGroup) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
    location
  )}?unitGroup=${unitGroup}&key=${VC_API_KEY}&contentType=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Location not found");
  return response.json();
}

async function fetchGif(searchTerm) {
  const url = `https://api.giphy.com/v1/gifs/translate?api_key=${GIPHY_KEY}&s=${encodeURIComponent(
    searchTerm
  )}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.data?.images?.original?.url) {
    return data.data.images.original.url;
  }
  throw new Error("No GIF found");
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

async function displayWeather() {
  const location = locationInput.value.trim();
  const unit = unitToggle.value;

  if (!location) {
    alert("Please enter a location.");
    return;
  }

  try {
    const weatherData = await fetchWeather(location, unit);
    const current = weatherData.currentConditions;
    const temp = current.temp;
    const desc = current.conditions;

    locationName.textContent = weatherData.resolvedAddress;
    description.textContent = `Condition: ${desc}`;
    temperature.textContent = `Temperature: ${temp}° ${
      unit === "us" ? "F" : "C"
    }`;

    updateBackground(temp, unit);

    try {
      const gifUrl = await fetchGif(desc);
      weatherGif.src = gifUrl;
      weatherGif.alt = desc;
    } catch {
      weatherGif.src = "";
    }
  } catch (err) {
    locationName.textContent = "";
    description.textContent = "";
    temperature.textContent = "";
    weatherGif.src = "";
    alert("Sorry, we couldn't find weather data for that location.");
    console.error(err);
  }
}

getWeatherBtn.addEventListener("click", displayWeather);

locationInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") displayWeather();
});

// Optional: Load default location
window.addEventListener("load", () => {
  locationInput.value = "New York";
  displayWeather();
});
