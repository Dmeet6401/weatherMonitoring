import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export const fetchLatestWeather = async (city) => {
  try {
    const response = await axios.get(`${BASE_URL}/current-temp?city=${city}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest weather data:', error);
    throw error;
  }
};

export const fetchAllTemp = async (city) => {  
  try {
    const response = await axios.get(`${BASE_URL}/all-temperatures?city=${city}`);    
    return response.data;
  } catch (error) {
    console.error('Error fetching weather summary:', error);
    throw error;
  }
};

export const fetchWeeklyTemp = async (city) => {  
  try {
    const response = await axios.get(`${BASE_URL}/weekly-temperatures?city=${city}`);    
    return response.data;
  } catch (error) {
    console.error('Error fetching weather summary:', error);
    throw error;
  }
};