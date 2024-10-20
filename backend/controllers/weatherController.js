const axios = require('axios');
const Weather = require('../models/weatherModel');

// Fetch weather data from OpenWeather API
const getWeatherData = async (city) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  try {
    const response = await axios.get(url);
    const { main, dt } = response.data;
    const { temp, feels_like } = main;
    const weatherMain = response.data.weather[0].main;

    // Convert temperature from Kelvin to Celsius
    const tempCelsius = temp - 273.15;
    const feelsLikeCelsius = feels_like - 273.15;

    // Prepare the result
    const result = {
      main: weatherMain,
      temp: tempCelsius.toFixed(2),
      feels_like: feelsLikeCelsius.toFixed(2),
      dt: new Date(dt * 1000), // Store as Date object
    };

    return result;
  } catch (error) {
    console.error(`Error fetching weather data for ${city}`, error);
    throw error;
  }
};

// Fetch and save data for each city
const fetchAndSaveWeatherData = async (city) => {
  const weatherData = await getWeatherData(city);
  const weatherEntry = new Weather({
    city,
    main: weatherData.main,
    temperature: weatherData.temp,
    feels_like: weatherData.feels_like,
    timestamp: weatherData.dt, // Store the API's date if needed
  });

  await weatherEntry.save();
  console.log(`Weather data for ${city} saved successfully.`);
};

module.exports = { getWeatherData, fetchAndSaveWeatherData };
