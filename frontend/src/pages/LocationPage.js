import React, { useState, useEffect } from 'react';

function LocationPage() {
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [error, setError] = useState(null);
    const [closestTemperature, setClosestTemperature] = useState(null);
    const [weatherCode, setWeatherCode] = useState(null);

    useEffect(() => {
        // Check if the Geolocation API is available in the browser
        if ('geolocation' in navigator) {
            // Get the current position
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                },
                (error) => {
                    setError(error.message);
                }
            );
        } else {
            setError('Geolocation is not available in this browser.');
        }
    }, []); // Empty dependency array to ensure useEffect runs only once

    useEffect(() => {
        if (latitude !== null && longitude !== null) {
            // Make API call to Open Meteo API for temperature
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`)
                .then(response => response.json())
                .then(data => {
                    // Extract temperature and time from response
                    const hourlyTemperature = data.hourly.temperature_2m;
                    const hourlyTime = data.hourly.time;

                    // Convert Celsius to Fahrenheit and pair with time
                    const fahrenheitTemperatureData = hourlyTemperature.map((temp, index) => ({
                        time: hourlyTime[index].split('T')[1].substring(0, 5), // Extract HH:mm from time
                        temperature: Math.round((temp * 9 / 5) + 32), // Round to nearest degree
                    }));

                    // Find the closest temperature entry to the current time
                    let closestEntry = null;
                    let minDifference = Number.MAX_VALUE;

                    fahrenheitTemperatureData.forEach(entry => {
                        const dateParts = entry.time.split(':');
                        const currentDate = new Date();
                        currentDate.setHours(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10), 0, 0);

                        // Calculate the time difference between current time and entry time
                        const timeDifference = Math.abs(currentDate - new Date());

                        if (timeDifference < minDifference) {
                            minDifference = timeDifference;
                            closestEntry = entry;
                        }
                    });

                    // Set the closest temperature state variable
                    setClosestTemperature(closestEntry);
                })
                .catch(error => {
                    console.error('Error fetching temperature:', error);
                });

            // Make API call to Open Meteo API for weather code
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=weather_code`)
                .then(response => response.json())
                .then(data => {
                    // Extract weather code from response
                    const weatherCode = data.hourly.weather_code;
                    setWeatherCode(weatherCode);
                })
                .catch(error => {
                    console.error('Error fetching weather code:', error);
                });
        }
    }, [latitude, longitude]); // Run this effect whenever latitude or longitude changes

    return (
        <div>
            {error ? (
                <p>Error getting location: {error}</p>
            ) : (
                <div>
                    <p>Latitude: {latitude}, Longitude: {longitude}</p>
                    {closestTemperature && (
                        <div>
                            <p>Closest Temperature:</p>
                            <p>{closestTemperature.time} - {closestTemperature.temperature} °F</p>
                        </div>
                    )}
                    {weatherCode && (
                        <div>
                            <p>Weather Code: {weatherCode}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default LocationPage;
