# Weather Monitoring System

##  App Link : https://weather-monitoring-topaz.vercel.app/ 

A React-based weather monitoring system that allows users to view
current weather conditions, historical temperature data, and weekly
summaries for various cities. Users can also set thresholds and receive
weather updates via email.

## Features

\- Display current weather data for a selected city.

\- Show weekly weather summary including minimum, maximum, and average
temperatures.

\- Set temperature thresholds and receive email notifications.

## Technologies Used

\- React

\- Node.js

\- Express

\- MongoDB

\- Axios

\- Chakra UI

\- Nodemailer

## Installation

Follow the steps below to set up the project on your local machine.

## Prerequisites

\- Node.js (v14 or higher)

\- npm (Node Package Manager)

\- MongoDB (or a MongoDB Atlas account)

### Step 1: Clone the Repository

Clone the repository to your local machine:

git clone \<repository-url\>

cd WeatherMonitoring

### Step 2: Set Up the Backend

1\. Navigate to the backend directory:

cd backend

2\. Install dependencies:

npm install

3\. Create a .env file in the backend directory with the following
variables:

PORT=5000

EMAIL_USER=your_email@example.com

EMAIL_PASS=your_email_password

MONGODB_URI=mongodb://localhost:27017/weatherMonitoring

Note: Replace your_email@example.com and your_email_password with your
actual email credentials. If using Gmail, you may need to generate an
app password.

4\. Start the backend server:

npm start

### Step 3: Set Up the Frontend

1\. Open a new terminal and navigate to the frontend directory:

cd frontend

2\. Install dependencies:

npm install

3\. Install necessary polyfills to handle Node.js core modules:

npm install path-browserify os-browserify crypto-browserify

4\. Create a config-overrides.js file in the frontend directory and add
the following configuration:

module.exports = function override(config, env) {

config.resolve.fallback = {

\"path\": require.resolve(\"path-browserify\"),

\"os\": require.resolve(\"os-browserify/browser\"),

\"crypto\": require.resolve(\"crypto-browserify\"),

\...config.resolve.fallback, // Ensure existing fallbacks are not
overwritten

};

return config;

};

5\. Update your package.json scripts to use react-app-rewired:

\"scripts\": {

\"start\": \"react-app-rewired start\",

\"build\": \"react-app-rewired build\",

\"test\": \"react-app-rewired test\",

\"eject\": \"react-scripts eject\"

}

6\. Start the frontend application:

npm start

### Step 4: Access the Application

Open your browser and navigate to http://localhost:3000 to view the
Weather Monitoring System.

## API Endpoints

Current Weather

\- GET /api/current-temp?city={city} - Fetch the latest weather data for
a specific city.

### All Temperatures

\- GET /api/all-temperatures?city={city} - Fetch all temperature records
for a specific city for the current day.

### Weekly Temperatures

\- GET /api/weekly-temperatures?city={city} - Fetch temperature data for
the past 7 days for a specific city.

### Set Threshold

\- POST /api/set-threshold - Set a temperature threshold for a user.

### Send Email

\- POST /api/send-email - Send an email notification to the user.

## Troubleshooting

\- If you encounter issues with module resolution, double-check that all
polyfills are installed and the config-overrides.js is set up correctly.

\- Ensure your MongoDB server is running if you\'re using a local
instance.

## Contributing

Contributions are welcome! Please create a pull request or open an issue
for discussion.
