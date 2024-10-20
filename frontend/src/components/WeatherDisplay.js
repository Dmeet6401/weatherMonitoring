import React, { useEffect, useState } from 'react';
import { fetchAllTemp, fetchLatestWeather } from '../services/weatherService';
import socketIOClient from 'socket.io-client';
import TemperatureChart from './DailyChart';
import WeeklyWeatherSummary from './WeeklyWeatherSummary';

const WeatherDisplay = ({getCity}) => {
  const [weatherData, setWeatherData] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Delhi'); // Default city
  const [weatherSummary, setWeatherSummary] = useState(null); // State for summary data
  const [socket, setSocket] = useState(null); // Store socket instance
  const [allTemp, setAllTemp] = useState([]); // Initialize as an empty array

  // Fetch the latest weather data and summary when the city changes
  useEffect(() => {
    const newSocket = socketIOClient(process.env.SOCKET_URL);
    setSocket(newSocket);
    newSocket.emit('citySelected', selectedCity);

    // Listen for weather updates from the server
    newSocket.on('update', (event) => {
      //console.log('Update from server:', event);
      setWeatherData(event); // Update state with new data
    });

    return () => {
      newSocket.disconnect();
    };
  }, [selectedCity]); // Include selectedCity in dependency array

  useEffect(() => {
    const getWeatherData = async () => {
      try {
        const data = await fetchLatestWeather(selectedCity);
        setWeatherData(data);

        // Fetch weather summary data
        const fetchedAllTemp = await fetchAllTemp(selectedCity);
        setAllTemp(fetchedAllTemp);
        
        let avg = 0;
        let mini = +100;
        let maxi = -100;
        
        fetchedAllTemp.forEach((element) => {
          mini = Math.min(mini, parseFloat(element.temperature));
          maxi = Math.max(maxi, parseFloat(element.temperature));
        });

        let sum = 0;
        for (let i = 0; i < fetchedAllTemp.length; i++) {
          sum += Number(fetchedAllTemp[i].temperature);
        }

        avg = sum / fetchedAllTemp.length;        
        setWeatherSummary({ mini, maxi, avg });

      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    getWeatherData();
  }, [selectedCity]); // Fetch new data when selectedCity changes

  // Handle city change event
  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
    getCity(event.target.value)
    if (socket) {
      socket.emit('citySelected', event.target.value); // Emit the citySelected event
    }
  };

  // Styles for WeatherDisplay component
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: 20,
      backgroundColor: '#f5f5f5',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
      marginBottom: 20,
      width: '90%', // Set width to 90%
      margin: '0 auto', // Center the component
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
    },
    select: {
      height: 40,
      borderRadius: 5,
      borderColor: '#ccc',
      borderWidth: 1,
      marginBottom: 15,
      padding: 10,
      backgroundColor: '#fff',
    },
    weatherCard: {
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 15,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 1,
    },
    weatherInfo: {
      fontSize: 16,
    },
    summarySection: {
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 15,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 1,
    },
    flexContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    updatesSection: {
      flex: 2,
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Weather Information</h2>
      <label style={styles.label} htmlFor="city-select">Select City: </label>
      <select style={styles.select} id="city-select" value={selectedCity} onChange={handleCityChange}>
        <option value="Delhi">Delhi</option>
        <option value="Mumbai">Mumbai</option>
        <option value="Chennai">Chennai</option>
        <option value="Bangalore">Bangalore</option>
        <option value="Kolkata">Kolkata</option>
        <option value="Hyderabad">Hyderabad</option>
      </select>

      <div style={styles.flexContainer}>
        {/* Display Weather Data */}
        <div style={styles.updatesSection}>
          {weatherData.length > 0 ? (
            weatherData.map((cityWeather) => (
              <div style={styles.weatherCard} key={cityWeather._id}>
                <h3 style={styles.weatherInfo}>{cityWeather._id}</h3>
                <p style={styles.weatherInfo}>Atmosphere: {cityWeather.main}</p>
                <p style={styles.weatherInfo}>Temperature: {cityWeather.temperature}°C</p>
                <p style={styles.weatherInfo}>Feels Like: {cityWeather.feels_like}°C</p>
                <p style={styles.weatherInfo}>Last Updated: {new Date(cityWeather.timestamp).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p>No data available for the selected city.</p>
          )}
        </div>

        {/* Display Summary Information */}
        {weatherSummary && (
          <div style={styles.summarySection}>
            <h3>Daily Weather Summary for {selectedCity}</h3>
            <p>Min Temperature: {weatherSummary.mini}°C</p>
            <p>Max Temperature: {weatherSummary.maxi}°C</p>
            <p>Average Temperature: {weatherSummary.avg.toFixed(2)}°C</p>
          </div>
        )}
      </div>

      <TemperatureChart allTemp={allTemp} />
    </div>
  );
};

export default WeatherDisplay;
