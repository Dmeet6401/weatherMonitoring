import React, { useState } from 'react';
import WeatherDisplay from './components/WeatherDisplay';
import './App.css'; // Make sure this line is at the top of your App.js
import WeeklyWeatherSummary from './components/WeeklyWeatherSummary';

const App = () => {
  // Styles for App component
  const styles = {
    appContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#e0f7fa', // Light blue background
      padding: '20px',
    },
    header: {
      backgroundColor: '#00796b', // Teal color
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '5px',
      width: '100%',
      textAlign: 'center',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Shadow effect
    },
    main: {
      backgroundColor: '#ffffff', // White background for main content
      borderRadius: '5px',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Shadow effect
      width: '90%', // Set width to 90%
      maxWidth: '50%', // Limit the maximum width for better readability
      margin: '0 auto', // Center the component
    },
  };

  const [selectedCity, setCity] = useState('Delhi')

  const getCity = (city) =>{
    setCity(city)
  }

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1>Weather Monitoring System</h1>
      </header>
      
      <main style={styles.main}>
        {/* Component to display the latest weather data */}
        <WeatherDisplay getCity={getCity}/>
        <WeeklyWeatherSummary city={selectedCity} />
      </main>
    </div>
  );
};

export default App;
