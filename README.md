# Weather Monitoring System

## Project Overview

This project is a real-time weather monitoring system developed using the MERN stack (MongoDB, Express, React, Node.js). It integrates data from the OpenWeatherMap API, aggregates weather information, and provides functionalities like setting temperature thresholds, unit conversion, daily/weekly data, and more. The system is built to handle real-time updates and user preferences.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Project Structure](#project-structure)
4. [API Endpoints](#api-endpoints)
    - [GET /weather/current-temp](#get-weathercurrent-temp)
    - [GET /weather/all-temperatures](#get-weatherall-temperatures)
    - [GET /weather/weekly-temperatures](#get-weatherweekly-temperatures)
    - [POST /weather/set-threshold](#post-weatherset-threshold)
    - [POST /weather/send-email](#post-weathersend-email)
5. [Environment Variables](#environment-variables)
6. [Technologies Used](#technologies-used)
7. [Deployed Project Link](#deployed-project-link)
8. [GitHub Repository](#github-repository)

## Features

- **Real-time Weather Updates**: Automatically fetches weather data every 5 minutes from OpenWeatherMap and stores it in MongoDB.
- **Temperature Unit Conversion**: Supports temperature data in Celsius, Fahrenheit, and Kelvin.
- **User Preferences**: Allows users to set temperature thresholds for alerts.
- **Email Notifications**: Sends emails to users when thresholds are exceeded.
- **Daily and Weekly Data**: Provides daily and weekly weather data for any city.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd weather-monitoring-system
   ```

3. Install server-side dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Install client-side dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

5. Start the backend server:
   ```bash
   cd ../backend
   npm start
   ```

6. Start the frontend client:
   ```bash
   cd ../frontend
   npm start
   ```

7. The application will be running on:
   - Backend: `http://localhost:8080`
   - Frontend: `http://localhost:3000`

## Project Structure

The project is organized as follows:

```
/backend
  ├── /models
  ├── /routes
  │   └── weatherRoutes.js
  ├── /services
  │   └── socket.js
  ├── app.js
  └── package.json

/frontend
  ├── /components
  ├── /pages
  ├── /services
  │   └── weatherServices.js
  ├── App.js
  ├── index.js
  └── package.json
```

## API Endpoints

### GET `/weather/current-temp`

**Description**: Fetches the latest weather data (temperature, feels like) for a specific city and returns it in the requested temperature unit (Celsius, Fahrenheit, Kelvin).

**Query Parameters**:
- `city`: (string) Name of the city (required).
- `unit`: (string) Unit of temperature (`celsius`, `fahrenheit`, `kelvin`). Defaults to Celsius.

**Example Request**:
```bash
GET /weather/current-temp?city=London&unit=fahrenheit
```

**Response**:
```json
[
  {
    "city": "London",
    "temperature": 75.4,
    "feels_like": 76.1,
    "timestamp": "2024-10-19T10:30:00.000Z"
  }
]
```

---

### GET `/weather/all-temperatures`

**Description**: Fetches all recorded temperatures for a specific city on the current day.

**Query Parameters**:
- `city`: (string) Name of the city (required).
- `unit`: (string) Unit of temperature (`celsius`, `fahrenheit`, `kelvin`). Defaults to Celsius.

**Example Request**:
```bash
GET /weather/all-temperatures?city=Paris&unit=kelvin
```

**Response**:
```json
[
  {
    "temperature": 298.15,
    "timestamp": "2024-10-19T09:15:00.000Z"
  },
  {
    "temperature": 299.65,
    "timestamp": "2024-10-19T10:30:00.000Z"
  }
]
```

---

### GET `/weather/weekly-temperatures`

**Description**: Fetches the weather data for a specific city for the past 7 days. It includes the daily average, minimum, maximum temperature, and dominant weather condition.

**Query Parameters**:
- `city`: (string) Name of the city (required).
- `unit`: (string) Unit of temperature (`celsius`, `fahrenheit`, `kelvin`). Defaults to Celsius.

**Example Request**:
```bash
GET /weather/weekly-temperatures?city=New%20York&unit=celsius
```

**Response**:
```json
[
  {
    "date": "2024-10-13",
    "avgTemp": "15.80",
    "minTemp": "14.00",
    "maxTemp": "17.00",
    "dominantWeather": "Cloudy",
    "dailyTemp": [
      { "temperature": 15.5, "timestamp": "2024-10-13T09:00:00.000Z" },
      { "temperature": 17.0, "timestamp": "2024-10-13T12:00:00.000Z" }
    ]
  },
]
```

---

### POST `/weather/set-threshold`

**Description**: Sets a temperature threshold for a user. This threshold can be used to trigger alerts or notifications.

**Body Parameters**:
- `email`: (string) User's email (required).
- `threshold`: (number) Temperature threshold (required).

**Example Request**:
```bash
POST /weather/set-threshold
Content-Type: application/json

{
  "email": "user@example.com",
  "threshold": 30
}
```

**Response**:
```json
{
  "message": "Threshold updated successfully."
}
```

---

### POST `/weather/send-email`

**Description**: Sends an email to the user with a subject and message.

**Body Parameters**:
- `email`: (string) Recipient's email (required).
- `subject`: (string) Email subject (required).
- `text`: (string) Email content (required).

**Example Request**:
```bash
POST /weather/send-email
Content-Type: application/json

{
  "email": "user@example.com",
  "subject": "Weather Alert",
  "text": "The temperature in your city has exceeded the threshold."
}
```

**Response**:
```json
{
  "message": "Email sent successfully."
}
```

## Environment Variables

To run this project, you will need to add the following environment variables in a `.env` file:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
OPENWEATHERMAP_API_KEY=your-openweathermap-api-key
MONGODB_URI=your-mongodb-connection-string
```

## Technologies Used

- **Frontend**: React, Chakra UI
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Styling**: Tailwind CSS, Chakra UI
- **Email Service**: Nodemailer

## Deployed Project Link

[Deployed Application](https://weather-monitoring-topaz.vercel.app/)

## GitHub Repository

[GitHub Repository](https://github.com/Dmeet6401/weatherMonitoring)

