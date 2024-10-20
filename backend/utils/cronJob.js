const cron = require('node-cron');
const { fetchAndSaveWeatherData } = require('../controllers/weatherController');
const { calculateWeatherSummary } = require('../controllers/weatherSummaryController');
const axios = require('axios');
const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

// Schedule weather data fetch every 5 minutes
const scheduleWeatherDataFetch = () => {
  cron.schedule('*/5 * * * *', () => {
    cities.forEach(async (city) => {
      try {
        await fetchAndSaveWeatherData(city);
      } catch (error) {
        console.error(`Error saving weather data for ${city}:`, error);
      }
    });
  });
};



// Schedule summary calculation at midnight every day
const scheduleWeatherSummaryCalculation = () => {
  cron.schedule('0 0 * * *', async () => {
    // cron.schedule('*/1 * * * *', async () => {
    try {
      await calculateWeatherSummary();
    } catch (error) {
      console.error('Error calculating weather summary:', error);
    }
  });
};

// Initialize both schedules
const initCronJobs = () => {
  scheduleWeatherDataFetch();
  scheduleWeatherSummaryCalculation();
};

module.exports = { initCronJobs };
