const express = require('express');
require('dotenv').config();
const nodemailer = require('nodemailer');
const Weather = require('../models/weatherModel');
const UserPreference = require('../models/userPreferences');

const router = express.Router();

// Helper function to convert temperature
function convertTemperature(temperature, unit) {
  if (unit === 'kelvin') {
    return temperature + 273.15; // Celsius to Kelvin
  } else if (unit === 'fahrenheit') {
    return (temperature * 9) / 5 + 32; // Celsius to Fahrenheit
  }
  return temperature; // Default is Celsius
}

// API route to fetch the latest weather data from the database for a specific city
router.get('/current-temp', async (req, res) => {
  const { city, unit } = req.query; // Get city and unit from query parameters
  const temperatureUnit = unit || 'celsius'; // Default to Celsius if unit is not provided

  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    // Find the latest weather data for the specified city based on the timestamp
    const latestWeatherData = await Weather.aggregate([
      { $match: { city: city } }, // Match the specified city
      { $sort: { timestamp: -1 } }, // Sort by latest timestamp (descending)
      {
        $group: {
          _id: "$city", // Group by city
          main: { $first: "$main" }, // Get the latest weather condition
          temperature: { $first: "$temperature" }, // Get the latest temperature
          feels_like: { $first: "$feels_like" }, // Get the latest 'feels like' temperature
          timestamp: { $first: "$timestamp" }, // Get the latest timestamp
        }
      }
    ]);

    // If no data found for the specified city
    if (latestWeatherData.length === 0) {
      return res.status(404).json({ message: 'No weather data found for the specified city' });
    }

    // Convert the temperature and feels_like to the requested unit
    latestWeatherData.forEach((data) => {
      data.temperature = convertTemperature(data.temperature, temperatureUnit);
      data.feels_like = convertTemperature(data.feels_like, temperatureUnit);
    });

    res.json(latestWeatherData);
  } catch (error) {
    console.error("Error fetching latest weather data:", error);
    res.status(500).json({ message: 'Error fetching weather data' });
  }
});

// API route to fetch all temperatures of the current day for a specific city
router.get('/all-temperatures', async (req, res) => {
  const { city, unit } = req.query; // Get city and unit from query parameters
  const temperatureUnit = unit || 'celsius'; // Default to Celsius if unit is not provided

  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00:00
    const endOfDay = new Date(); // Current time

    // Find all weather data for the specified city within the current day
    const allTemperatures = await Weather.find({
      city: city,
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    }).select('temperature timestamp'); // Select only the temperature and timestamp fields

    // If no data is found for the city within the current day
    if (allTemperatures.length === 0) {
      return res.status(404).json({ message: 'No temperature data found for the specified city today' });
    }

    // Convert the temperatures to the requested unit
    allTemperatures.forEach((data) => {
      data.temperature = convertTemperature(data.temperature, temperatureUnit);
    });

    res.json(allTemperatures);
  } catch (error) {
    console.error("Error fetching all temperatures:", error);
    res.status(500).json({ message: 'Error fetching temperature data' });
  }
});

// API route to fetch weekly temperatures for a specific city
router.get('/weekly-temperatures', async (req, res) => {
  const { city, unit } = req.query; // Get city and unit from query parameters
  const temperatureUnit = unit || 'celsius'; // Default to Celsius if unit is not provided

  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    const endOfDay = new Date(); // Current time
    const startOfLastWeek = new Date();
    startOfLastWeek.setDate(endOfDay.getDate() - 7); // Go back 7 days
    startOfLastWeek.setHours(0, 0, 0, 0); // Set time to start of the day

    // Find all weather data for the specified city within the last 7 days
    const weeklyTemperatures = await Weather.find({
      city: city,
      timestamp: { $gte: startOfLastWeek, $lte: endOfDay }
    }).select('temperature timestamp dominantWeather'); // Select only necessary fields

    // If no data is found for the city
    if (weeklyTemperatures.length === 0) {
      return res.status(404).json({ message: 'No temperature data found for the specified city in the last 7 days' });
    }

    // Group the data by date
    const temperatureDataByDate = {};
    weeklyTemperatures.forEach((tempData) => {
      const date = new Date(tempData.timestamp).toISOString().split('T')[0]; // Get the date string
      if (!temperatureDataByDate[date]) {
        temperatureDataByDate[date] = {
          dailyTemp: [],
          dominantWeather: tempData.dominantWeather,
        };
      }
      tempData.temperature = convertTemperature(tempData.temperature, temperatureUnit); // Convert temperature
      temperatureDataByDate[date].dailyTemp.push(tempData);
    });

    // Prepare the response format
    const response = Object.keys(temperatureDataByDate).map((date) => {
      const dailyTemps = temperatureDataByDate[date].dailyTemp.map(t => parseFloat(t.temperature));
      const avgTemp = dailyTemps.reduce((a, b) => a + b, 0) / dailyTemps.length;
      const minTemp = Math.min(...dailyTemps);
      const maxTemp = Math.max(...dailyTemps);

      return {
        date: date,
        avgTemp: avgTemp.toFixed(2), // Format to 2 decimal places
        minTemp: minTemp.toFixed(2),
        maxTemp: maxTemp.toFixed(2),
        dominantWeather: temperatureDataByDate[date].dominantWeather,
        dailyTemp: temperatureDataByDate[date].dailyTemp, // Raw daily temperature data with timestamp
      };
    });

    // Send the formatted response
    res.json(response);
  } catch (error) {
    console.error("Error fetching weekly temperatures:", error);
    res.status(500).json({ message: 'Error fetching temperature data' });
  }
});

// API route to set temperature threshold for alerts
router.post('/set-threshold', async (req, res) => {
  const { email, threshold } = req.body;

  // Validate input
  if (!email || threshold === undefined) {
    return res.status(400).json({ message: 'Email and threshold are required.' });
  }

  try {
    // Check if user preference already exists
    let userPreference = await UserPreference.findOne({ email });

    if (userPreference) {
      // If user preference exists, update the threshold
      userPreference.threshold = threshold;
      userPreference.timestamp = new Date(); // Update timestamp to current time
      await userPreference.save(); // Save changes
    } else {
      // If user preference does not exist, create a new entry
      userPreference = new UserPreference({
        email,
        threshold,
        timestamp: new Date() // Set timestamp to current time
      });
      await userPreference.save(); // Save the new user preference
    }

    res.json({ message: 'Threshold updated successfully.' });
  } catch (error) {
    console.error('Error setting threshold:', error);
    res.status(500).json({ message: 'Error setting threshold.' });
  }
});

// Nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  service: 'gmail', // Use your email service (e.g., Gmail, Outlook)
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// API route to send an email to the user
router.post('/send-email', async (req, res) => {
  const { email, subject, text } = req.body;

  // Validate input
  if (!email || !subject || !text) {
    return res.status(400).json({ message: 'Email, subject, and text are required.' });
  }

  try {
    // Setup email data
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject : subject,
      text : text,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email.' });
  }
});

module.exports = router;
