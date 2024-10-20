const { Server } = require('socket.io');
const Weather = require('../models/weatherModel');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ORIGIN_SOCKET, // Update with your frontend URL
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    let selectedCity = 'Delhi'; // Default city
    let intervalId; // Variable to hold the interval ID

    // Listen for city selection from the client
    socket.on('citySelected', (city) => {
      console.log(`City selected: ${city}`);
      selectedCity = city; // Update the selected city

      // Clear the existing interval if it's already running
      if (intervalId) {
        clearInterval(intervalId);
      }

      // Set a new interval to emit the weather data every 5 minutes
      intervalId = setInterval(async () => {
        const weatherData = await Weather.aggregate([
          { $match: { city: selectedCity } },  // Match the selected city
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

        // Emit the update event with the fetched data
        socket.emit('update', weatherData);
      }, 5 * 60 * 1000); // Emit every 5 minutes
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      clearInterval(intervalId); // Clear the interval when the client disconnects
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = {
  initSocket,
  getIo,
};
