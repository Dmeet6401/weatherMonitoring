const express = require('express');
require('dotenv').config();
const nodemailer = require('nodemailer');
const Weather = require('../models/weatherModel');

const UserPreference = require('../models/userPreferences');

const router = express.Router();

// API route to fetch the latest weather data from the database for a specific city
router.get('/current-temp', async (req, res) => {
  const { city } = req.query; // Get city from query parameters

  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    // Find the latest weather data for the specified city based on the timestamp
    const latestWeatherData = await Weather.aggregate([
      { $match: { city: city } },  // Match the specified city
      { $sort: { timestamp: -1 } },  // Sort by latest timestamp (descending)
      {
        $group: {
          _id: "$city",  // Group by city
          main: { $first: "$main" },  // Get the latest weather condition
          temperature: { $first: "$temperature" },  // Get the latest temperature
          feels_like: { $first: "$feels_like" },  // Get the latest 'feels like' temperature
          timestamp: { $first: "$timestamp" }  // Get the latest timestamp
        }
      }
    ]);

    // If no data found for the specified city
    if (latestWeatherData.length === 0) {
      return res.status(404).json({ message: 'No weather data found for the specified city' });
    }

    res.json(latestWeatherData);
  } catch (error) {
    console.error("Error fetching latest weather data:", error);
    res.status(500).json({ message: 'Error fetching weather data' });
  }
});

router.get('/all-temperatures', async (req, res) => {
  const { city } = req.query; // Get city from query parameters

  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    // Get the start and end of the current day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00:00

    const endOfDay = new Date(); // Current time
  //   const yesterday = new Date();
  //   yesterday.setDate(yesterday.getDate() - 1);
  //   const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
  // const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

    // Find all weather data for the specified city within the current day
    const allTemperatures = await Weather.find({
      city: city,
      timestamp: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).select('temperature timestamp'); // Select only the temperature and timestamp fields

    // If no data is found for the city within the current day
    if (allTemperatures.length === 0) {
      return res.status(404).json({ message: 'No temperature data found for the specified city today' });
    }

    // Send response with all temperatures
    res.json(allTemperatures);
  } catch (error) {
    console.error("Error fetching all temperatures:", error);
    res.status(500).json({ message: 'Error fetching temperature data' });
  }
});

//original format
router.get('/weekly-temperatures', async (req, res) => {
  const { city } = req.query; // Get city from query parameters

  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    // Get the start and end of the current day
    const endOfDay = new Date(); // Current time
    const startOfLastWeek = new Date();
    startOfLastWeek.setDate(endOfDay.getDate() - 7); // Go back 7 days
    startOfLastWeek.setHours(0, 0, 0, 0); // Set time to start of the day

    // Find all weather data for the specified city within the last 7 days
    const weeklyTemperatures = await Weather.find({
      city: city,
      timestamp: {
        $gte: startOfLastWeek,
        $lte: endOfDay
      }
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
    
    res.json({
      message: 'Threshold updated successfully.'
    });
  } catch (error) {
    console.error('Error setting threshold:', error);
    res.status(500).json({ message: 'Error setting threshold.' });
  }
});



const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  service: 'gmail', // Use your email service (e.g., Gmail, Outlook)
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
    // user: process.env.EMAIL_USER, // Your email address
    // pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});
// API route to send an email to the user
router.post('/send-email', async (req, res) => {
  const { email, subject, text } = req.body;
  console.log(email,subject,text);
  
  // Validate input
  if (!email || !subject || !text) {
    return res.status(400).json({ message: 'Email, subject, and text are required.' });
  }

  try {
    // Setup email data
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: text,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email.' });
  }
});
module.exports = router;

