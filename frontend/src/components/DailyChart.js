import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from 'chart.js';

// Register necessary components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

const TemperatureChart = ({ allTemp }) => {
    
    // Prepare data for the chart if allTemp is available
    const labels = allTemp.map(item => new Date(item.timestamp).toLocaleTimeString());
    const temperatures = allTemp.map(item => parseFloat(item.temperature));
    
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Temperature (°C)',
                data: temperatures,
                fill: false,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1, // Smooth curve
            },
        ],
    };

    const options = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Temperature (°C)',
                },
            },
        },
    };

    return (
        <div>
            <h2>Time vs Temperature</h2>
            <Line data={data} options={options} />
        </div>
    );
};

export default TemperatureChart;
