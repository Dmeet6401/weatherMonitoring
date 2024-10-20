const mongoose = require('mongoose');

const weatherSummarySchema = new mongoose.Schema({
  city: { type: String, required: true },
  min_temp: { type: Number, required: true },
  max_temp: { type: Number, required: true },
  avg_temp: { type: Number, required: true },
  dominant_weather: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WeatherSummary', weatherSummarySchema);
