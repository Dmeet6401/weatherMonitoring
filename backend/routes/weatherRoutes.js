const express = require('express');
const Weather = require('../models/weatherModel');

const router = express.Router();

// API route to fetch the latest weather data from the database for a specific city
router.get('/current-temp', async (req, res) => {
  const { city } = req.query; // Get city from query parameters

  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    // Find the latest weather data for the specified city based on the timestamp
    const latestWeatherData = await Weather.aggregate([
      { $match: { city: city } },  // Match the specified city
      { $sort: { timestamp: -1 } },  // Sort by latest timestamp (descending)
      {
        $group: {
          _id: "$city",  // Group by city
          main: { $first: "$main" },  // Get the latest weather condition
          temperature: { $first: "$temperature" },  // Get the latest temperature
          feels_like: { $first: "$feels_like" },  // Get the latest 'feels like' temperature
          timestamp: { $first: "$timestamp" }  // Get the latest timestamp
        }
      }
    ]);

    // If no data found for the specified city
    if (latestWeatherData.length === 0) {
      return res.status(404).json({ message: 'No weather data found for the specified city' });
    }

    res.json(latestWeatherData);
  } catch (error) {
    console.error("Error fetching latest weather data:", error);
    res.status(500).json({ message: 'Error fetching weather data' });
  }
});

router.get('/all-temperatures', async (req, res) => {
  const { city } = req.query; // Get city from query parameters

  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    // Get the start and end of the current day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00:00

    const endOfDay = new Date(); // Current time
  //   const yesterday = new Date();
  //   yesterday.setDate(yesterday.getDate() - 1);
  //   const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
  // const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

    // Find all weather data for the specified city within the current day
    const allTemperatures = await Weather.find({
      city: city,
      timestamp: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).select('temperature timestamp'); // Select only the temperature and timestamp fields

    // If no data is found for the city within the current day
    if (allTemperatures.length === 0) {
      return res.status(404).json({ message: 'No temperature data found for the specified city today' });
    }

    // Send response with all temperatures
    res.json(allTemperatures);
  } catch (error) {
    console.error("Error fetching all temperatures:", error);
    res.status(500).json({ message: 'Error fetching temperature data' });
  }
});

//original format
router.get('/weekly-temperatures', async (req, res) => {
  const { city } = req.query; // Get city from query parameters

  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    // Get the start and end of the current day
    const endOfDay = new Date(); // Current time
    const startOfLastWeek = new Date();
    startOfLastWeek.setDate(endOfDay.getDate() - 7); // Go back 7 days
    startOfLastWeek.setHours(0, 0, 0, 0); // Set time to start of the day

    // Find all weather data for the specified city within the last 7 days
    const weeklyTemperatures = await Weather.find({
      city: city,
      timestamp: {
        $gte: startOfLastWeek,
        $lte: endOfDay
      }
    }).select('temperature timestamp dominantWeather'); // Select only necessary fields

    // If no data is found for the city
    if (weeklyTemperatures.length === 0) {
      return res.status(404).json({ message: 'No temperature data found for the specified city in the last 7 days' });
    }

    // Group the data by date
    const temperatureDataByDate = {};
    weeklyTemperatures.forEach((tempData) => {
      const date = new Date(tempData.timestamp).toISOString().split('T')[0]; // Get the date string
      if (!temperatureDataByDate[date]) {
        temperatureDataByDate[date] = {
          dailyTemp: [],
          dominantWeather: tempData.dominantWeather,
        };
      }
      temperatureDataByDate[date].dailyTemp.push(tempData);
    });

    // Prepare the response format
    const response = Object.keys(temperatureDataByDate).map((date) => {
      const dailyTemps = temperatureDataByDate[date].dailyTemp.map(t => parseFloat(t.temperature));
      const avgTemp = dailyTemps.reduce((a, b) => a + b, 0) / dailyTemps.length;
      const minTemp = Math.min(...dailyTemps);
      const maxTemp = Math.max(...dailyTemps);

      return {
        date: date,
        avgTemp: avgTemp.toFixed(2), // Format to 2 decimal places
        minTemp: minTemp.toFixed(2),
        maxTemp: maxTemp.toFixed(2),
        dominantWeather: temperatureDataByDate[date].dominantWeather,
        dailyTemp: temperatureDataByDate[date].dailyTemp, // Raw daily temperature data with timestamp
      };
    });

    // Send the formatted response
    res.json(response);
  } catch (error) {
    console.error("Error fetching weekly temperatures:", error);
    res.status(500).json({ message: 'Error fetching temperature data' });
  }
});


//meet code
// router.get('/weekly-temperatures', async (req, res) => {
//   const { city } = req.query; // Get city from query parameters

//   if (!city) {
//     return res.status(400).json({ message: 'City parameter is required' });
//   }

//   try {
//     // Get the start and end of the current day
//     const endOfDay = new Date(); // Current time
//     const startOfLastWeek = new Date();
//     startOfLastWeek.setDate(endOfDay.getDate() - 7); // Go back 7 days
//     startOfLastWeek.setHours(0, 0, 0, 0); // Set time to start of the day

//     // Find all weather data for the specified city within the last 7 days
//     const weeklyTemperatures = await Weather.find({
//       city: city,
//       timestamp: {
//         $gte: startOfLastWeek,
//         $lte: endOfDay
//       }
//     }).select('temperature timestamp dominantWeather'); // Select only necessary fields

//     // If no data is found for the city
//     if (weeklyTemperatures.length === 0) {
//       return res.status(404).json({ message: 'No temperature data found for the specified city in the last 7 days' });
//     }

//     // Group the data by date and hour
//     const temperatureDataByDateAndHour = {};
//     weeklyTemperatures.forEach((tempData) => {
//       const date = new Date(tempData.timestamp).toISOString().split('T')[0]; // Get the date string
//       const hour = new Date(tempData.timestamp).getUTCHours(); // Get the hour (UTC)

//       if (!temperatureDataByDateAndHour[date]) {
//         temperatureDataByDateAndHour[date] = {};
//       }
//       if (!temperatureDataByDateAndHour[date][hour]) {
//         temperatureDataByDateAndHour[date][hour] = {
//           dailyTemp: [],
//           dominantWeather: tempData.dominantWeather,
//         };
//       }

//       // Add temperature for that hour
//       temperatureDataByDateAndHour[date][hour].dailyTemp.push(tempData);
//     });

//     // Prepare the response format
//     const response = Object.keys(temperatureDataByDateAndHour).map((date) => {
//       const hourlyData = Object.keys(temperatureDataByDateAndHour[date]).map((hour) => {
//         const hourlyTemps = temperatureDataByDateAndHour[date][hour].dailyTemp.map(t => parseFloat(t.temperature));
//         const avgHourlyTemp = hourlyTemps.reduce((a, b) => a + b, 0) / hourlyTemps.length;
//         const minHourlyTemp = Math.min(...hourlyTemps);
//         const maxHourlyTemp = Math.max(...hourlyTemps);

//         return {
//           hour: `${hour}:00`,
//           avgTemp: avgHourlyTemp.toFixed(2), // Format to 2 decimal places
//           minTemp: minHourlyTemp.toFixed(2),
//           maxTemp: maxHourlyTemp.toFixed(2),
//           dominantWeather: temperatureDataByDateAndHour[date][hour].dominantWeather,
//           hourlyTemp: temperatureDataByDateAndHour[date][hour].dailyTemp, // Raw hourly temperature data with timestamp
//         };
//       });

//       return {
//         date: date,
//         hourlyData: hourlyData, // All hourly data for this date
//       };
//     });

//     // Send the formatted response
//     res.json(response);
//   } catch (error) {
//     console.error("Error fetching weekly temperatures:", error);
//     res.status(500).json({ message: 'Error fetching temperature data' });
//   }
// });


//harsh code
router.get('/weekly-temperatures', async (req, res) => {
  const { city } = req.query; // Get city from query parameters

  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    // Get the start and end of the current day
    const endOfDay = new Date(); // Current time
    const startOfLastWeek = new Date();
    startOfLastWeek.setDate(endOfDay.getDate() - 7); // Go back 7 days
    startOfLastWeek.setHours(0, 0, 0, 0); // Set time to start of the day

    // Find all weather data for the specified city within the last 7 days
    const weeklyTemperatures = await Weather.find({
      city: city,
      timestamp: {
        $gte: startOfLastWeek,
        $lte: endOfDay
      }
    }).select('temperature timestamp dominantWeather'); // Select only necessary fields

    // If no data is found for the city
    if (weeklyTemperatures.length === 0) {
      return res.status(404).json({ message: 'No temperature data found for the specified city in the last 7 days' });
    }

    // Group the data by date and hour
    const temperatureDataByDateAndHour = {};

    weeklyTemperatures.forEach((tempData) => {
      const date = new Date(tempData.timestamp).toISOString().split('T')[0]; // Get the date string

      // Round the timestamp to the nearest hour
      const tempDate = new Date(tempData.timestamp);
      const minutes = tempDate.getMinutes();
      const roundedHour = minutes >= 30 ? tempDate.getHours() + 1 : tempDate.getHours(); // Round up or down
      const roundedTimestamp = new Date(tempDate.setHours(roundedHour, 0, 0, 0)).toISOString(); // Set minutes, seconds, and milliseconds to 0

      // Initialize the date entry if it doesn't exist
      if (!temperatureDataByDateAndHour[date]) {
        temperatureDataByDateAndHour[date] = {
          hourlyData: {}
        };
      }

      console.log(hourlyData);
      

      // Initialize the hourly entry if it doesn't exist
      if (!temperatureDataByDateAndHour[date].hourlyData[roundedHour]) {
        temperatureDataByDateAndHour[date].hourlyData[roundedHour] = {
          totalTemperature: 0,
          count: 0,
          dominantWeather: tempData.dominantWeather,
          _id: tempData._id, // Store the first _id for reference
          timestamp: roundedTimestamp // Use the rounded timestamp
        };
      }

      // Accumulate the temperature data
      temperatureDataByDateAndHour[date].hourlyData[roundedHour].totalTemperature += parseFloat(tempData.temperature);
      temperatureDataByDateAndHour[date].hourlyData[roundedHour].count += 1;
    });

    // Prepare the response format
    const response = Object.keys(temperatureDataByDateAndHour).map((date) => {
      return {
        date: date,
        dailyTemp: Object.keys(temperatureDataByDateAndHour[date].hourlyData).map((hour) => {
          console.log(hour);
          const hourlyData = temperatureDataByDateAndHour[date].hourlyData[hour];
          const avgTemperature = (hourlyData.totalTemperature / hourlyData.count).toFixed(2); // Calculate average

          return {
            _id: hourlyData._id, // Use the first temperature's _id for the hour
            temperature: avgTemperature, // Average temperature for the hour
            timestamp: hourlyData.timestamp, // Use the rounded timestamp
          };
        }),
        // Calculate daily min and max temperature
        minTemp: Math.min(...Object.keys(temperatureDataByDateAndHour[date].hourlyData).map(hour => {
          return temperatureDataByDateAndHour[date].hourlyData[hour].totalTemperature / temperatureDataByDateAndHour[date].hourlyData[hour].count;
        })).toFixed(2),
        maxTemp: Math.max(...Object.keys(temperatureDataByDateAndHour[date].hourlyData).map(hour => {
          return temperatureDataByDateAndHour[date].hourlyData[hour].totalTemperature / temperatureDataByDateAndHour[date].hourlyData[hour].count;
        })).toFixed(2),
        avgTemp: ((Object.keys(temperatureDataByDateAndHour[date].hourlyData).reduce((sum, hour) => {
          return sum + (temperatureDataByDateAndHour[date].hourlyData[hour].totalTemperature / temperatureDataByDateAndHour[date].hourlyData[hour].count);
        }, 0) / Object.keys(temperatureDataByDateAndHour[date].hourlyData).length)).toFixed(2), // Daily average temperature
        dominantWeather: temperatureDataByDateAndHour[date].hourlyData[Object.keys(temperatureDataByDateAndHour[date].hourlyData)[0]].dominantWeather, // Use dominant weather of the first hour
      };
    });

    // Send the formatted response
    res.json(response);
  } catch (error) {
    console.error("Error fetching weekly temperatures:", error);
    res.status(500).json({ message: 'Error fetching temperature data' });
  }
});





module.exports = router;

// module.exports = router;


// [
//   {
//     "date": "2024-10-14",
//     "avgTemp": "26.00",
//     "minTemp": "24.00",
//     "maxTemp": "28.00",
//     "dominantWeather": "Clear Sky",
//     "dailyTemp": [
//       {
//           "_id": "6713fe2cf3ebe3b98f3e91dd",
//           "temperature": "25.00", // this should be avg of hourlyTemp in object.dailyTemp.hourlyTempz
//           "timestamp": "2024-10-14T00:15:36.000Z"
//       },
//       {
//         "_id": "6713fe2cf3ebe3b98f3e91dd",
//         "temperature": "25.00",
//         "timestamp": "2024-10-14T00:15:36.000Z"
//     },
//     ]
//   }
// ]
