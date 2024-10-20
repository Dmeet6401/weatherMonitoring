import axios from 'axios';

const BASE_URL = "http://localhost:5000/api";

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

export const setThresholdAndEmail = async (threshold, email) => {  
  try {
    const response = await axios.post(`${BASE_URL}/set-threshold`, { 
      threshold, 
      email 
    });    
    return response.data;
  } catch (error) {
    console.error('Error setting threshold:', error);
    throw error;
  }
};

export const sendEmail = async (email, subject, text) => {
  console.log(email,subject,text);
  
  try {
    const response = await axios.post(`${BASE_URL}/send-email`, {
      email : email,
      subject : subject,
      text: text,
    });
    return response.data; // Handle the response data
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Throw the error so the caller can handle it
  }
};