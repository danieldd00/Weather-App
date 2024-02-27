import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const zipAPI_URL = "http://api.openweathermap.org/geo/1.0/zip";
const weatherAPI_URL = "https://api.openweathermap.org/data/2.5/weather";
const weatherIcon_URL = "https://openweathermap.org/img/wn/";
const API_Key = "916e40435b01c05c5cd6f1b200bb4e09";
const units = "imperial";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs"); // Set the view engine to EJS

app.get("/", (req, res) => {
  res.render("index.ejs", {
    cityName: "--",
    latitude: "--",
    longitude: "--",
    temperature: "--",
    tempMax: "--",
    tempMin: "--",
    feelsLike: "--",
    humidity: "--",
    weatherDescr: "--",
    icon: "--",
    wind: "--",
    gusts: "--",
  });
});

app.post("/search", async (req, res) => {
  const searchQuery = req.body.search;

  try {
    // Get zip code details from input
    const getZipCode = await axios.get(
      `${zipAPI_URL}?zip=${searchQuery}&appid=${API_Key}`
    );

    // Get weather details using latitude and longitude
    const getWeather = await axios.get(
      `${weatherAPI_URL}?lat=${getZipCode.data.lat}&lon=${getZipCode.data.lon}&appid=${API_Key}&units=${units}`
    );

    // Make the temperature a whole number instead of decimal
    const temperature = Math.round(getWeather.data.main.temp);
    const tempMax = Math.round(getWeather.data.main.temp_max);
    const tempMin = Math.round(getWeather.data.main.temp_min);
    const feels_like = Math.round(getWeather.data.main.feels_like);

    // Render the response
    res.render("index.ejs", {
      cityName: getZipCode.data.name,
      latitude: getZipCode.data.lat,
      longitude: getZipCode.data.lon,
      temperature: temperature,
      tempMax: tempMax,
      tempMin: tempMin,
      feelsLike: feels_like,
      humidity: getWeather.data.main.humidity,
      weatherDescr: getWeather.data.weather[0].description,
      icon: `${weatherIcon_URL}/${getWeather.data.weather[0].icon}@2x.png`,
      wind: getWeather.data.wind.speed,
      gusts: getWeather.data.wind.gust,
    });
  } catch (error) {
    console.error(error.response.data);
    res.status(500).send("Error fetching data from Weather API");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
