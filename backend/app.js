const express = require('express');
const mongoose = require('mongoose');
const weatherRoutes = require('./routes/weatherRoutes');
const { initCronJobs } = require('./utils/cronJob');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const cors = require('cors');
require('dotenv').config();

const http = require('http');
const { initSocket } = require('./services/socket'); // Import the socket logic

const app = express();

const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
app.use(cors());

// Middleware
app.use(express.json());
sessionMiddleware(app); // Use session middleware

// Routes
app.use('/api', weatherRoutes);

// Start the cron jobs
initCronJobs(); // Call the function to initialize both cron jobs

// MongoDB connection and server start
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    // More logs to debug the server starting process
    console.log('Starting server...');
    
    const server = http.createServer(app); 
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });    
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process if the DB connection fails
  });
