const Weather = require('../models/weatherModel');
const WeatherSummary = require('../models/weatherSummaryModel');

// Function to fetch weather data and calculate summary
const calculateWeatherSummary = async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1); // Set to yesterday's date
  const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
  const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

  try {
    // Fetch weather data for each city from yesterday
    const weatherData = await Weather.aggregate([
      {
        $match: {
          timestamp: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: '$city',
          min_temp: { $min: { $toDouble: '$temperature' } },
          max_temp: { $max: { $toDouble: '$temperature' } },
          avg_temp: { $avg: { $toDouble: '$temperature' } },
          dominant_weather: { $first: '$main' }, // Get dominant weather condition (could use a more complex logic if needed)
        },
      },
    ]);

    // Insert the calculated summaries into the weatherSummaries collection
    const summaries = weatherData.map((data) => ({
      city: data._id,
      min_temp: data.min_temp,
      max_temp: data.max_temp,
      avg_temp: data.avg_temp,
      dominant_weather: data.dominant_weather,
      date: yesterday, // Store the date for yesterday
    }));

    await WeatherSummary.insertMany(summaries);
    console.log('Weather summaries saved successfully:', summaries);
  } catch (error) {
    console.error('Error calculating weather summary:', error);
  }
};

// Expose the function for external use
module.exports = { calculateWeatherSummary };
