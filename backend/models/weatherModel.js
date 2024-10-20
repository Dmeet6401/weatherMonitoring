const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  city: String,
  main: String,
  temperature: String,
  feels_like: String,
  timestamp: { type: Date, default: Date.now }
});

const Weather = mongoose.model('Weather', weatherSchema);

module.exports = Weather;
