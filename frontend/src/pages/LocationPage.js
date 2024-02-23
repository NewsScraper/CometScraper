import React, { useState, useEffect } from 'react';
import sunIcon from '../components/icons8-sun-50.png';
import partlyCloudyIcon from '../components/icons8-partly-cloudy-day-50.png';
import hailIcon from '../components/icons8-hail-50.png';
import snowIcon from '../components/icons8-snow-50.png';
import stormIcon from '../components/icons8-storm-50.png';
import sleetIcon from '../components/icons8-sleet-50.png';
import heavyRainIcon from '../components/icons8-heavy-rain-50.png';
import drizzleIcon from '../components/icons8-light-rain-50.png';
import fogIcon from '../components/icons8-cloud-50.png';

function LocationPage() {
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [error, setError] = useState(null);
    const [closestTemperature, setClosestTemperature] = useState(null);
    const [weatherCode, setWeatherCode] = useState(null);
    const [weatherImage, setWeatherImage] = useState(null);
    const [displayedWeatherImages, setDisplayedWeatherImages] = useState([]);

    // Define weatherImages within the component scope
    const weatherImages = {
        '0': sunIcon,
        '1': partlyCloudyIcon,
        '2': partlyCloudyIcon,
        '3': partlyCloudyIcon,
        '45': fogIcon,
        '48': fogIcon,
        '51': drizzleIcon,
        '53': drizzleIcon,
        '55': drizzleIcon,
        '61': heavyRainIcon,
        '63': heavyRainIcon,
        '65': heavyRainIcon,
        '80': heavyRainIcon,
        '81': heavyRainIcon,
        '82': heavyRainIcon,
        '66': sleetIcon,
        '67': sleetIcon,
        '56': snowIcon,
        '57': snowIcon,
        '71': snowIcon,
        '73': snowIcon,
        '75': snowIcon,
        '77': snowIcon,
        '85': snowIcon,
        '86': snowIcon,
        '95': stormIcon,
        '96': hailIcon,
        '99': hailIcon,
        // Add more mappings for other weather codes
    };

    useEffect(() => {
        if ('geolocation' in navigator) {
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
    }, []);

    useEffect(() => {
        if (latitude !== null && longitude !== null) {
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code`)
                .then(response => response.json())
                .then(data => {
                    const hourlyTemperature = data.hourly.temperature_2m;
                    const hourlyTime = data.hourly.time;
                    const hourlyWeatherCode = data.hourly.weather_code;

                    const fahrenheitTemperatureData = hourlyTemperature.map((temp, index) => ({
                        time: hourlyTime[index].split('T')[1].substring(0, 5),
                        temperature: Math.round((temp * 9 / 5) + 32),
                        weatherCode: hourlyWeatherCode[index],
                    }));

                    let closestEntry = null;
                    let minDifference = Number.MAX_VALUE;

                    fahrenheitTemperatureData.forEach(entry => {
                        const dateParts = entry.time.split(':');
                        const currentDate = new Date();
                        currentDate.setHours(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10), 0, 0);

                        let timeDifference = Math.abs(currentDate - new Date());
                        const currentDateBackward = new Date(currentDate);
                        currentDateBackward.setHours(currentDate.getHours() - 1);
                        const timeDifferenceBackward = Math.abs(currentDateBackward - new Date());

                        if (timeDifferenceBackward < timeDifference) {
                            timeDifference = timeDifferenceBackward;
                        }

                        if (timeDifference < minDifference) {
                            minDifference = timeDifference;
                            closestEntry = entry;
                        }
                    });

                    setClosestTemperature(closestEntry);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [latitude, longitude]);

    

    useEffect(() => {
        if (closestTemperature) {
            setWeatherCode(closestTemperature.weatherCode);
            // Set the weather image based on the weather code
            if (weatherImages.hasOwnProperty(closestTemperature.weatherCode)) {
                setWeatherImage(weatherImages[closestTemperature.weatherCode]);
            }
        }
    }, [closestTemperature, weatherImages]);
    

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
                            <p>Time: {closestTemperature.time}, Temperature: {closestTemperature.temperature} °F, Weather Code: {weatherCode}</p>
                            {weatherImage && (
                                <div>
                                    <img src={weatherImage} alt="Weather" />
                                    <div>
                                        <p>All Weather Images:</p>
                                        <div>
                                            {Object.keys(weatherImages).map(code => (
                                                !displayedWeatherImages.includes(code) && (
                                                    <img 
                                                        key={code} 
                                                        src={weatherImages[code]} 
                                                        alt={`Weather Code ${code}`} 
                                                        onClick={() => setDisplayedWeatherImages(prevState => [...prevState, code])} 
                                                    />
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                </div>
            )}
        </div>
    );
}

export default LocationPage;
