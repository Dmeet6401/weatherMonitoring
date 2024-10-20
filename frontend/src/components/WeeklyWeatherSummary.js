import React, { useEffect, useState } from 'react';
import TemperatureChart from './DailyChart'; // Dummy chart component
import { fetchWeeklyTemp } from '../services/weatherService';


// Helper function to convert date to day name
const getDayName = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const WeeklyWeatherSummary = ({city}) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState([]);

    useEffect(()=>{
        const getWeatherData = async () => {
            try {
                const weeklyWeatherSummary = await fetchWeeklyTemp(city);
                setWeeklySummary(weeklyWeatherSummary)
            } catch (error) {
              console.error('Error fetching weather data:', error);
            }
          };
      
          getWeatherData();
        
    },[city])

  // Handle day click and select the day to display in the chart
  const handleDayClick = (index) => {
    setSelectedDay(index === selectedDay ? null : index); // Toggle selection
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1000px',
      margin: '0 auto',
      backgroundColor: '#f9f9f9',
    },
    daysWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      overflowX: 'auto',
    },
    dayCard: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '15px',
      margin: '0 10px',
      cursor: 'pointer',
      minWidth: '120px',
      flex: '0 0 auto',
    },
    expandedCard: {
      marginTop: '10px',
      backgroundColor: '#eef',
      borderRadius: '5px',
      padding: '15px',
    },
    chartWrapper: {
      marginTop: '20px',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
  };

  return (
    <div style={styles.container}>
      <h2>Weekly Weather Summary</h2>

      <div style={styles.daysWrapper}>
        {weeklySummary.map((dayData, index) => (
          <div key={index} style={styles.dayCard} onClick={() => handleDayClick(index)}>
            <h3>{getDayName(dayData.date)}</h3>
            <p>Avg Temp: {dayData.avgTemp}°C</p>
          </div>
        ))}
      </div>

      {/* Display detailed information and chart if a day is selected */}
      {selectedDay !== null && (
        <div style={styles.chartWrapper}>
          <h3>Weather Details for {getDayName(weeklySummary[selectedDay].date)}</h3>
          <p>Min Temp: {weeklySummary[selectedDay].minTemp}°C</p>
          <p>Max Temp: {weeklySummary[selectedDay].maxTemp}°C</p>
          <p>Dominant Weather: {weeklySummary[selectedDay].dominantWeather}</p>

          {/* Chart Component */}
          <TemperatureChart allTemp={weeklySummary[selectedDay].dailyTemp} />
        </div>
      )}
    </div>
  );
};

export default WeeklyWeatherSummary;
