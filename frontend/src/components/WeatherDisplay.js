import React, { useEffect, useState } from 'react';
import { fetchAllTemp, fetchLatestWeather, sendEmail, setThresholdAndEmail } from '../services/weatherService';
import socketIOClient from 'socket.io-client';
import TemperatureChart from './DailyChart';
import WeeklyWeatherSummary from './WeeklyWeatherSummary';

const WeatherDisplay = ({ getCity }) => {
  const [weatherData, setWeatherData] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Delhi'); // Default city
  const [weatherSummary, setWeatherSummary] = useState(null); // State for summary data
  const [socket, setSocket] = useState(null); // Store socket instance
  const [allTemp, setAllTemp] = useState([]); // Initialize as an empty array
  const [threshold, setThreshold] = useState(''); // State for threshold
  const [email, setEmail] = useState(''); // State for email
  const [error, setError] = useState(''); // State for error messages
  const [upperThreshold, setUpperThreshold] = useState(0);
  const [lowerThreshold, setLowerThreshold] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState('celsius'); 
  // Fetch the latest weather data and summary when the city changes
  useEffect(() => {
    const newSocket = socketIOClient(process.env.ORIGIN_SOCKET);
    setSocket(newSocket);
    newSocket.emit('citySelected', selectedCity);

    // Listen for weather updates from the server
    newSocket.on('update', (event) => {
      // console.log(event);
      // console.log(email,threshold,event[0].temperature, upperThreshold);
      
      setWeatherData(event); // Update state with new data
      if(email != "" && threshold != "" && event[0].temperature > threshold && upperThreshold == 0){
        setUpperThreshold(1);
        sendEmail(email,"Weather Service",`Temperature is increased by the threshold. Current temperature is ${event[0].temperature}`);
      }
      if(email != "" && threshold != "" && event[0].temperature < threshold && lowerThreshold == 0){
        setLowerThreshold(1);
        sendEmail(email,"Weather Service",`Temperature is decreased by the threshold. Current temperature is ${event[0].temperature}`);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [selectedCity,threshold,email,selectedUnit]); // Include selectedCity in dependency array

  useEffect(() => {
    const getWeatherData = async () => {
      try {
        const data = await fetchLatestWeather(selectedCity,selectedUnit);
        setWeatherData(data);

        // Fetch weather summary data
        const fetchedAllTemp = await fetchAllTemp(selectedCity,selectedUnit);
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
  }, [selectedCity,selectedUnit]); // Fetch new data when selectedCity changes

  // Handle city change event
  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
    getCity(event.target.value);
    if (socket) {
      socket.emit('citySelected', event.target.value); // Emit the citySelected event
    }
  };

  // Handle setting threshold with validation
  const handleSetThreshold = async () => {
    if (!threshold || isNaN(threshold) || threshold < 0 || threshold > 99) {
      setError('Please enter a valid temperature threshold (0-99 °C).');
      return;
    }

    if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const res = await setThresholdAndEmail(threshold, email);
      console.log(res);
      // Reset fields after successful submission
      // setThreshold('');
      // setEmail('');
      setError(''); // Clear error
    } catch (error) {
      console.error('Error setting threshold:', error);
      setError('Error setting threshold. Please try again.');
    }
  };

  const handleUnitChange = (event) => {
    setSelectedUnit(event.target.value); // Update the selected unit
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
      width: '90%',
      margin: '0 auto',
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
    thresholdContainer: {
      marginTop: 20,
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 15,
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    },
    input: {
      marginRight: '10px',
      padding: '8px',
      borderRadius: '5px',
      border: '1px solid #ccc',
    },
    button: {
      padding: '8px 12px',
      borderRadius: '5px',
      backgroundColor: '#00796b',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
    },
    error: {
      color: 'red',
      marginTop: '10px',
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

      <label htmlFor="unit">Select Temperature Unit: </label>
      <select
        id="unit"
        value={selectedUnit}
        onChange={handleUnitChange}
        style={styles.select}
      >
        <option value="celsius">Celsius</option>
        <option value="fahrenheit">Fahrenheit</option>
        <option value="kelvin">Kelvin</option>
      </select>

      <div style={styles.flexContainer}>
        {/* Display Weather Data */}
        <div style={styles.updatesSection}>
        {weatherData.length > 0 ? (
          weatherData.map((cityWeather) => (
            <div style={styles.weatherCard} key={cityWeather._id}>
              <h3 style={styles.weatherInfo}>{cityWeather._id}</h3>
              <p style={styles.weatherInfo}>Atmosphere: {cityWeather.main}</p>
              <p style={styles.weatherInfo}>
                Temperature: {parseFloat(cityWeather.temperature).toFixed(2)}° {selectedUnit.charAt(0).toUpperCase() + selectedUnit.slice(1)}
              </p>
              <p style={styles.weatherInfo}>
                Feels Like: {parseFloat(cityWeather.feels_like).toFixed(2)}° {selectedUnit.charAt(0).toUpperCase() + selectedUnit.slice(1)}
              </p>
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
          <h3>Daily Weather Summary for {weatherSummary.city}</h3>
          <p>Min Temperature: {weatherSummary.mini.toFixed(2)}° {selectedUnit.charAt(0).toUpperCase() + selectedUnit.slice(1)}</p>
          <p>Max Temperature: {weatherSummary.maxi.toFixed(2)}° {selectedUnit.charAt(0).toUpperCase() + selectedUnit.slice(1)}</p>
          <p>Average Temperature: {weatherSummary.avg.toFixed(2)}° {selectedUnit.charAt(0).toUpperCase() + selectedUnit.slice(1)}</p>
        </div>
      )}
      </div>

      {/* Threshold Functionality */}
      <div style={styles.thresholdContainer}>
        <h3>Set Threshold for Alerts</h3>
        <input
          type="number"
          placeholder="Threshold (°C)"
          value={threshold}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || /^\d{0,2}$/.test(value)) {  // Only allow up to 2 digits
              setThreshold(value);
            }
          }}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email for Notifications"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSetThreshold} style={styles.button}>Set Threshold</button>

        {error && <p style={styles.error}>{error}</p>}
      </div>

      <TemperatureChart allTemp={allTemp} unit={selectedUnit}/>
    </div>
  );
};

export default WeatherDisplay;
