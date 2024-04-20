import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "../components/home.module.css";
import { Box } from "@mui/system";
import yourImage from '../components/face-png-42654.png';
import yourImage2 from '../components/sad-6485840_1280.png';
import yourImage1 from '../components/laq6inkc58lo1do6so8toa8m9d.png';
import upArrow from "../components/upArrow.png";
import downArrow from "../components/downArrow.png";
import fintechLogo from "../components/FinTech_logo.png";
import { teal, pink , red, grey} from "@mui/material/colors";
import { alpha } from '@mui/material/styles';
import sunIcon from '../components/icons8-sun-50.png';
import partlyCloudyIcon from '../components/icons8-partly-cloudy-day-50.png';
import hailIcon from '../components/icons8-hail-50.png';
import snowIcon from '../components/icons8-snow-50.png';
import stormIcon from '../components/icons8-storm-50.png';
import sleetIcon from '../components/icons8-sleet-50.png';
import heavyRainIcon from '../components/icons8-heavy-rain-50.png';
import drizzleIcon from '../components/icons8-light-rain-50.png';
import fogIcon from '../components/icons8-cloud-50.png';
import { database, auth, googleAuthProvider } from "../config/firebase";
import { useHistory } from "react-router-dom";
import firebase from 'firebase/compat/app';
import userLogo from "../components/user-128.png";
import Chart from 'chart.js/auto';
import BouncingDotsLoader from "../components/BouncingDotsLoader";

import {
  Button,
  Typography,
  ButtonGroup,
  createTheme,
  ThemeProvider,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ActivityRow from "../components/ActivityRow";
import HomeNewsRow from "../components/HomeNewsRow";
const decreasedRed = alpha("#ff0000", 0.675); // 0.7 is the alpha value, you can adjust it

function ResultsPage() {
  const location = useLocation();
  const history = useHistory();
  const searchParams = new URLSearchParams(location.search);
  const stockTicker = searchParams.get("ticker");
  const [stockData, setStockData] = useState(null);
  const [newsItems, setNewsItems] = useState([]); // Define state for newsItems
  const [showAll, setShowAll] = useState(false); // Toggle between showing all articles or not
  const [isExpanded, setIsExpanded] = useState(false); // State to track box expansion
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const currentDate = new Date();
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [error, setError] = useState(null);
  const [closestTemperature, setClosestTemperature] = useState(null);
  const [weatherCode, setWeatherCode] = useState(null);
  const [weatherImage, setWeatherImage] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [closePrices, setClosePrices] = useState([]);
  const chartRef = useRef(null); // Reference to the chart canvas element
  const [isGraphVisible, setIsGraphVisible] = useState(false); // State to track if the graph is visible
  const [refresh, setRefresh] = useState(false); // State to track if the graph is visible

  const dateTime = currentDate.toISOString(); // Convert to ISO string format 
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayOfWeek = days[currentDate.getDay()];
  const month = months[currentDate.getMonth()];
  const dayOfMonth = currentDate.getDate();

  const formattedDate = `${dayOfWeek}, ${month} ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)}`;
  const [stockTickerSentimentArray, setStockTickerSentimentArray] = useState([]);


  const box1Ref = useRef(null);
  const box2Ref = useRef(null);
  const box3Ref = useRef(null);
  const box4Ref = useRef(null);
  const [line1Coordinates, setLine1Coordinates] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const [line2Coordinates, setLine2Coordinates] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });


  useEffect(() => {
    
    const checkLoggedInStatus = async () => {
      try {
        await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

        const user = await auth.currentUser;
        if (user) {
          setLoggedIn(true);
          console.log("User is logged in");
          
        } else {
          setLoggedIn(false);
          console.log("User is logged out");

          history.push(`/login`);
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
      }
      try {
        const user = auth.currentUser;
        const name1 = await user.displayName;

        if (user) {
          const uid = user.uid;
          // Get user data from the database
          const userSnapshot = await database.ref(`users/${uid}`).once('value');
          const userData = userSnapshot.val();
          // Extract and set the first name to state
          if (userData && userData.firstName) {
            setFirstName(", " + userData.firstName + "!");
          }
          else{
            setFirstName (", " + name1 + "!")

          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    checkLoggedInStatus();
  
    return () => {
      // Cleanup logic if necessary
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (stockTicker && stockTicker.trim() !== '') {
          const res = await fetch(`http://127.0.0.1:5000/sentiment?ticker=${stockTicker}`);
          
          if (!res.ok) {
            console.log("Network response was not ok.");
            throw new Error("Network response was not ok.");
          } else {
            console.log("Network response was ok.");
          }
  
          let sentimentData;
          try {
            sentimentData = await res.json();
          } catch (error) {
            console.error('Error parsing JSON:', error);
            // Handle the error gracefully, e.g., set sentimentData to a default value
            sentimentData = {};
          }
  
          if (sentimentData) {
            setStockData(sentimentData);
            console.log(sentimentData);
  
            // Update newsItems here if there are articles
            if (sentimentData["Articles"].length !== 0) {

              setNewsItems(
                sentimentData["Articles"].map((article) => {
                  const { title, score, href, info, date } = article;
                  return {
                    title,
                    date: date,
                    source: info,
                    href,
                    score,
                  };
                })
              );
              console.log(sentimentData["Articles"]);

            } else {
              // If there are no articles, set newsItems to an empty array
             
              
            }
  
            console.log(sentimentData["Close Prices"]);
            if (sentimentData["Close Prices"]) {
              setClosePrices(sentimentData["Close Prices"]);
            }
  
            const trendingValues = [
              sentimentData["Stock"],
              sentimentData["Compound Score"], // Convert to integer
              dateTime, // Convert to integer
            ];
  
            console.log("trending valued" + trendingValues);
            addToWatchlist(trendingValues);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
  
    fetchData();
  }, [stockTicker]); // Only stockTicker as dependency
  
  
  useEffect(() => {
    const uploadToDatabase = async () => {
      try {
        console.log(stockTickerSentimentArray);
       
        const user = await auth.currentUser;
        if (user ) { // Check if watchlistArray is not empty
            // Upload the updated watchlistArray to the database
            const stockName = stockTickerSentimentArray[0][0];
    
            const snapshot = await database.ref(`sentiment/${stockName}`).once('value');
            let existingData = snapshot.val() || []; // Initialize as an empty array if no data exists
            
            // Check if any entry in existingData has the same date as the current date
            const currentDate = new Date().toISOString().slice(0, 10); // Get current date in "YYYY-MM-DD" format
            const hasEntryForCurrentDate = existingData.some(entry => entry[2].slice(0, 10) === currentDate);
            
            if (!hasEntryForCurrentDate && stockTickerSentimentArray[0][1] != 0) {
                // Append the new data to the existing data
                existingData = existingData.concat(stockTickerSentimentArray);
                
                // Update the database with the combined data
                await database.ref(`sentiment/${stockName}`).set(existingData);
                console.log('Success');
            } else {
                console.log('Entry for current date already exists, not appending data.');
            }
        }
    } catch (error) {
        console.error('Error updating user data:', error);
    }
    
    };
    
    // Call uploadToDatabase whenever watchlistArray changes
    uploadToDatabase();
    }, [stockTickerSentimentArray]); 

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
      // Determine the weather image based on the weather code
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
      
      if (weatherImages.hasOwnProperty(closestTemperature.weatherCode)) {
          setWeatherImage(weatherImages[closestTemperature.weatherCode]);
      }
  }
}, [closestTemperature]);

  const handleViewToggleClick = () => {
    setShowAll(!showAll);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleBoxClick = () => {
    setIsExpanded(!isExpanded); // Toggle the expansion state
  };

  const handleTimeInterval = (interval) => {
    switch (interval) {
        case '1d':
            // Handle 1 day interval
            const oned = closePrices.slice(-2);
            drawChart(oned, "Days Ago (Closing Prices)");
            break;
        case '5d':
            // Handle 5 day interval
            const fived = closePrices.slice(-5);
            drawChart(fived, "Days Ago (Closing Prices)");
            break;
        case '1m':
            // Handle 1 month interval
            const onem = closePrices.slice(-31);
            drawChart(onem, "Days Ago (Closing Prices)");
            break;
        case '6m':
            // Handle 6 month interval
            const sixm = closePrices.slice(-183);
            drawChart(sixm, "Days Ago (Closing Prices)");
            break;
        case '1y':
            // Handle 1 year interval
            const oney = closePrices.slice(-365);
            drawChart(oney, "Days Ago (Closing Prices)");
            break;
        case '5y':
            // Handle 5 year interval
            const fivey = closePrices.filter((price, index) => index % 30 === 0).slice(-60); // Adjusted to show monthly data points over 5 years
            drawChart(fivey, "Months Ago (Closing Prices)");
            break;
        case 'max':
            // Handle maximum interval
            const monthlyClosePrices = closePrices.filter((price, index) => index % 30 === 0); // Assuming 30 days in a month
            drawChart(monthlyClosePrices, "Months Ago (Closing Prices)");
            break;
        default:
            const monthlyClosePrices1 = closePrices.filter((price, index) => index % 30 === 0); // Assuming 30 days in a month
            drawChart(monthlyClosePrices1, "Months Ago (Closing Prices)");
            // Handle default case
            break;
    }

     // Redraw the chart after handling the interval
};
  
  const buttonStyle = {
    backgroundColor: '#1976D2',
    color: 'white',
    borderRight: '1px solid #AAAAAA', // Change the color here
  };

  function getOrdinalSuffix(day) {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }


 const addToWatchlist = async (item) => {
  // Create a new array by spreading the existing watchlistArray and appending the new item
  const updatedArray = [...stockTickerSentimentArray, item];
  // Set the state with the updated array
  setStockTickerSentimentArray(updatedArray);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      history.push(`/`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettings = async () => {
    console.log("settings")
    history.push(`/settings`);
  }

  useEffect(() => {
    if (isGraphVisible) {
      const monthlyClosePrices1 = closePrices.filter((price, index) => index % 30 === 0); // Assuming 30 days in a month
      drawChart(monthlyClosePrices1, "Months Ago (Closing Prices)");
    }
  }, [isGraphVisible, closePrices]);

  const handleBox1Click = () => {
    
    setTimeout(() => {
      const scrollContainer = document.getElementById('scrollContainer');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0; // Scroll to the top
      }
    
      // Call setIsGraphVisible and setRefresh after scrolling
      setIsGraphVisible(!isGraphVisible);
      setRefresh(!refresh);
    }, 100); // Adjust the delay time as needed
    

};



  const drawChart = (prices, title) => {
    if (prices && prices.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      let myChart = chartRef.current.myChart; // Get the reference to the previous chart instance
      const lastIndex = prices.length; // Get the last index

      if (myChart) {
        myChart.destroy(); // Destroy the previous chart instance
      }
      myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: prices.map((_, index) => lastIndex - index), // Reverse labels
          datasets: [{
            label: ' $',
            data: prices,
            backgroundColor: 'rgba(75, 192, 192, 0.4)',
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: true,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: title,
              },
            },
            y: {
              beginAtZero: false,
              title: {
                display: false,
                text: 'Price (USD)',
              },
            },
           
          },
          events: ['mousemove', 'mouseout', 'touchstart', 'touchmove'],
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  var label = context.dataset.label || '';
                  if (label) {
                    label += ' ';
                  }
                  if (context.parsed.y !== null) {
                    label += '' + context.parsed.y.toFixed(2);;
                  }
                  return label;
                },
                title: function(context) {
                  var label = context[0].label || '';
                  if (label) {
                      label += ' ';
                  }
                  label += title.slice(0, title.indexOf(" ("));
                  return label;
              }
              }
            },
            legend: {
              display: false // Hide the legend
            }
          }
        },
        interaction: {
          mode: 'index', // Set interaction mode if needed
          intersect: false // Disable point intersection
        }
      });
      chartRef.current.myChart = myChart; // Store the reference to the new chart instance
    }
  };
  
  
  useEffect(() => {
    if (box1Ref.current && box2Ref.current) {
        const box1Rect = box1Ref.current.getBoundingClientRect();
        const box2Rect = box2Ref.current.getBoundingClientRect();
      
        // Calculate the middle of the right edge of box1
        let x1 = box1Rect.right;
        let y1 = box1Rect.top + box1Rect.height / 2 - 80;
    
        // Calculate the middle of the left edge of box2
        let x2 = box2Rect.left;
        let y2 = box2Rect.top + box2Rect.height / 2;

        // Update the state with the line coordinates
        setLine1Coordinates({ x1, y1, x2, y2 });
    }
    
    if (box3Ref.current && box4Ref.current) {
        const box3Rect = box3Ref.current.getBoundingClientRect();
        const box4Rect = box4Ref.current.getBoundingClientRect();
    
        // Calculate the middle of the right edge of box3
        let x1 = box3Rect.right;
        let y1 = box3Rect.top + box3Rect.height / 2 - 80;
    
        // Calculate the middle of the left edge of box4
        let x2 = box4Rect.left;
        let y2 = box4Rect.top + box4Rect.height / 2;

        // Update the state with the line coordinates
        setLine2Coordinates({ x1, y1, x2, y2 });
    }
}, [isGraphVisible, isExpanded, box1Ref, box2Ref, box3Ref, box4Ref, stockData, refresh]);


const handleHome = () => {
  history.push(`/search`);
};


  return (      

      <div id="scrollContainer" className="custom-grid" style={{ overflowY: "auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px", backgroundColor: "transparent" }}>
          <div style={{ display: "flex", alignItems: "center", paddingRight: "20px" }}>
            <Typography
              variant="h5"
              onClick={handleHome}
              style={{ fontFamily: "Avenir", color: "black", fontSize: "1.75rem", whiteSpace: 'nowrap' }}
              sx={{
                marginLeft: "10px",
                marginRight: "17.5px",
                fontWeight: "bold",
                cursor: 'pointer',

              }}
            >
              CometScraper
            </Typography>
            <img src={fintechLogo} alt="Logo" style={{ width: "100px", height: "35px", borderRadius: "0%", cursor:"pointer" } }onClick={handleHome} />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
              <p style={{ fontWeight: 500, margin: "0", fontFamily: "Avenir", color: "black", fontSize: "17px" }}>
                Welcome{firstName}
              </p>
              <div style={{ borderLeft: "1px solid black", height: "25px", marginLeft: "10px", marginRight: "10px", marginBottom: "2.5px" }}></div>
              <p style={{ fontWeight: 500, margin: "0", fontFamily: "Avenir", color: "black", marginRight: "12.5px", fontSize: "17px" }}>
                {formattedDate}
              </p>
              {weatherImage && (
                <div>
                  <img src={weatherImage} alt="Weather" style={{width: "30px", height: "30px", marginRight: "9px", marginTop: "0em" }} />
                </div>
              )}
              {closestTemperature && (
  
                <p style={{ fontWeight: 500, margin: "0", fontFamily: "Avenir", color: "black", marginRight: "15px", fontSize:"17px"}}>{closestTemperature.temperature}° F</p>
  
              )}
            </div>
            <div style={{ position: 'relative' }}>
              
          <img
            src={userLogo}
            alt="Profile"
            style={{ width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer", marginRight: "10px",  }}
            onClick={toggleDropdown}
          />
          {dropdownVisible && (
    <div id={styles.dropDown} style={{ fontFamily: "Avenir", position: 'absolute', top: '40px', right: '0', border: "1px solid", borderColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '5px', zIndex: 9999 }}>
        <ul style={{ listStyleType: 'none', margin: '0', padding: '0' }}>
            <li style={{ padding: '10px', cursor: 'pointer' }} onClick={handleSettings} >Settings</li>
            <hr style={{ width: '100%', margin: '0', borderTop: '1px solid #ccc' }} /> {/* Divider */}
            <li style={{ padding: '10px', cursor: 'pointer', textAlign: 'center' }} onClick={handleLogout}>Logout</li> {/* Centered text */}
        </ul>
    </div>
)}
        </div>

          </div>
        </div>
     <div>
            {stockData? (
        <div   style={{ fontFamily: "Avenir", color: "black", textAlign: "center", height: "90vh", display: "flex", flexDirection: "column", paddingTop: "20px" }}>
          <div  style={{ position: "relative", height: "calc(100%)", display: "grid", gridTemplateRows: "1fr 1fr", gridTemplateColumns: "1fr 1fr", gap: "0px" }}>
          
          
          {stockData ? (
            <>
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: -4 }}>
                    <line x1={line1Coordinates.x1} y1={line1Coordinates.y1} x2={(line1Coordinates.x1 + line1Coordinates.x2) / 1.95} y2={line1Coordinates.y1} style={{ stroke: '#00827e', strokeWidth: 3 }} />
                    <path
                        d={`M ${(line1Coordinates.x1 + line1Coordinates.x2) / 1.95} ${line1Coordinates.y1}
                            C ${(line1Coordinates.x1 + line1Coordinates.x2) / 1.95 + 30} ${line1Coordinates.y1},
                              ${(line1Coordinates.x1 + line1Coordinates.x2) / 1.95 + 2} ${line1Coordinates.y1 - (isExpanded ? 30 : 15)},
                              ${(line1Coordinates.x1 + line1Coordinates.x2) / 1.95 + 30} ${line1Coordinates.y1 - (isExpanded ? 30 : 15)}`}
                        style={{ stroke: '#00827e', fill: 'none', strokeWidth: 3 }}
                    />
                    <line x1={(line1Coordinates.x1 + line1Coordinates.x2) / 1.95 + 30} y1={line1Coordinates.y1 - (isExpanded ? 30 : 15)} x2={line1Coordinates.x2} y2={line1Coordinates.y1 - (isExpanded ? 30 : 15)} style={{ stroke: '#00827e', strokeWidth: 3 }} />
                    <path
                        d={`M ${(line1Coordinates.x1 + line1Coordinates.x2) / 1.95} ${line1Coordinates.y1}
                            C ${(line1Coordinates.x1 + line1Coordinates.x2) / 1.95 + 30} ${line1Coordinates.y1},
                              ${(line1Coordinates.x1 + line1Coordinates.x2) / 1.95 + 2} ${line1Coordinates.y1 + (isExpanded ? 30 : 15)},
                              ${(line1Coordinates.x1 + line1Coordinates.x2) / 1.95 + 30} ${line1Coordinates.y1 + (isExpanded ? 30 : 15)}`}
                        style={{ stroke: '#00827e', fill: 'none', strokeWidth: 3 }}
                    />
                    <line x1={(line1Coordinates.x1 + line1Coordinates.x2) / 1.95 + 30} y1={line1Coordinates.y1 + (isExpanded ? 30 : 15)} x2={line1Coordinates.x2} y2={line1Coordinates.y1 + (isExpanded ? 30 : 15)} style={{ stroke: '#00827e', strokeWidth: 3 }} />
                </svg>
                <svg width="100%" height="100%" style={{ position: 'absolute', top: -40, left: 0, zIndex: -4 }}>
                    <line x1={line2Coordinates.x2} y1={line2Coordinates.y1} x2={(line2Coordinates.x1 + line2Coordinates.x2) / 2.05} y2={line2Coordinates.y1} style={{ stroke: '#00827e', strokeWidth: 3 }} />
                    <path
                        d={`M ${(line2Coordinates.x2 + line2Coordinates.x1) / 2.05} ${line2Coordinates.y1}
                            C ${(line2Coordinates.x2 + line2Coordinates.x1) / 2.05 - 30} ${line2Coordinates.y1},
                              ${(line2Coordinates.x2 + line2Coordinates.x1) / 2.05 - 2} ${line2Coordinates.y1 - (showAll ? 30 : 15)},
                              ${(line2Coordinates.x2 + line2Coordinates.x1) / 2.05 - 30} ${line2Coordinates.y1 - (showAll ? 30 : 15)}`}
                        style={{ stroke: '#00827e', fill: 'none', strokeWidth: 3 }}
                    />
                    <line x1={(line2Coordinates.x2 + line2Coordinates.x1) / 2.05 - 30} y1={line2Coordinates.y1 - (showAll ? 30 : 15)} x2={line2Coordinates.x1} y2={line2Coordinates.y1 - (showAll ? 30 : 15)} style={{ stroke: '#00827e', strokeWidth: 3 }} />
                    <path
                        d={`M ${(line2Coordinates.x2 + line2Coordinates.x1) / 2.05} ${line2Coordinates.y1}
                            C ${(line2Coordinates.x2 + line2Coordinates.x1) / 2.05 - 30} ${line2Coordinates.y1},
                              ${(line2Coordinates.x2 + line2Coordinates.x1) / 2.05 - 2} ${line2Coordinates.y1 + (showAll ? 30 : 15)},
                              ${(line2Coordinates.x2 + line2Coordinates.x1) / 2.05 - 30} ${line2Coordinates.y1 + (showAll ? 30 : 15)}`}
                        style={{ stroke: '#00827e', fill: 'none', strokeWidth: 3 }}
                    />
                    <line x1={(line2Coordinates.x2 + line2Coordinates.x1) / 2.05 - 30} y1={line2Coordinates.y1 + (showAll ? 30 : 15)} x2={line2Coordinates.x1} y2={line2Coordinates.y1 + (showAll ? 30 : 15)} style={{ stroke: '#00827e', strokeWidth: 3 }} />
                </svg>
            </>
            ) : (
            <div></div>
          )}

            <div style={{ marginTop: "5px", paddingBottom: "150px", border: "0px solid black", display: "flex", alignItems: "center", justifyContent: "center", height: "60%" }}>
              {
                <div  className="content-container"  >
                  {stockData && isGraphVisible ? (
                    <div>
                      <h2>Price Chart</h2>
                      <Box
                        ref={box1Ref}
                        id={styles.accountCard}
                        sx={{
                          width: "fit-content",
                          borderRadius: 3,
                          border: "2px solid #00000020",
                          borderColor: "#00000020",
                          marginBottom: '5%',
                          borderWidth: 3,
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                        className="overflow-y-scroll overflow-x-hidden"
                        onClick={() =>{

                          
                        }}
                      >
                        <div>
                          <canvas onClick={handleBox1Click} ref={chartRef} width="400" height="200"></canvas>
                          <div style={{ marginTop: '5px' }}>
                            <ButtonGroup variant="contained" aria-label="time-intervals">
                              <Button onClick={() => handleTimeInterval('1d')}>1d</Button>
                              <Button onClick={() => handleTimeInterval('5d')}>5d</Button>
                              <Button onClick={() => handleTimeInterval('1m')}>1m</Button>
                              <Button onClick={() => handleTimeInterval('6m')}>6m</Button>
                              <Button onClick={() => handleTimeInterval('1y')}>1y</Button>
                              <Button onClick={() => handleTimeInterval('5y')}>5y</Button>
                              <Button onClick={() => handleTimeInterval('max')} style={{ borderRight: 'none' }}>Max</Button>
                            </ButtonGroup>
                          </div>
                        </div>
                      </Box>
                    </div>
                  ) : (
                    <div className="content-container" onClick={handleBox1Click}>
                      {stockData && !isGraphVisible ? (
                        <Box
                          ref={box1Ref}
                          id={styles.accountCard}
                          sx={{
                            width: "fit-content",
                            borderRadius: 3,
                            border: "2px solid #00000020",
                            borderColor: "#00000020",
                            marginBottom: '5%',
                            borderWidth: 3,
                            padding: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',

                          }}
                          className="overflow-y-scroll overflow-x-hidden"
                        >
                          {/* Content container */}
                          <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px', marginBottom: '8px', marginRight: '20px' }}>
                            {/* First Column (Stock Name) */}
                            <div style={{ marginTop: '-12px', marginLeft: '18px' }}>
                              <h1 style={{ fontSize: "32px", marginBottom: 0 }}>{stockTicker.toUpperCase()}</h1>
                            </div>
                            {/* Arrow */}
                            <div style={{ marginTop: '2px', marginLeft: '7.5px' }}>
                              {/* Arrow Images */}
                              {stockData && (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  {stockData["dChange"] > 0 && (
                                    <img src={upArrow} alt="Up Arrow" style={{ height: "50px", width: "auto" }} />
                                  )}
                                  {stockData["dChange"] < 0 && (
                                    <img src={downArrow} alt="Down Arrow" style={{ height: "50px", width: "auto" }} />
                                  )}
                                </div>
                              )}
                            </div>
                            {/* Third Column (Value, dChange, and pChange) */}
                            <div style={{ marginLeft: '2px' }}>
                              {stockData && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                  <p style={{ fontSize: "22px", whiteSpace: 'nowrap', marginBottom: '10px', marginTop: '15px' }}>
                                    {stockData["Value"].toFixed(2)}  <span style={{ fontSize: '15px', color: grey[600] }}>USD</span>
                                  </p>
                                  <p style={{ fontSize: "16px", whiteSpace: 'nowrap', marginBottom: '10px', marginTop: '-5px', marginLeft: '-5px', color: stockData["dChange"].toFixed(2) < 0 ? decreasedRed : teal[500] }}>
                                    {stockData["dChange"] > 0 ? `+${stockData["dChange"].toFixed(2)}` : stockData["dChange"].toFixed(2)} ({Math.abs(stockData["pChange"]).toFixed(2)}%)
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </Box>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  )}
  
                </div>
              }
            </div>
            <div style={{ marginBottom: "5em", border: "0px solid black", padding: "0px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {
                <div className="content-container" style={{ marginTop: "4em", paddingBottom: "127.75px", }}>
                  {stockData ? (
                    <div
                      ref={box2Ref}
                      id={styles.accountCard}
                      style={{
                        width: "47.5vw",
                        borderRadius: 10,
                        border: "2px solid #00000020",
                        borderColor: "#00000020",
                        paddingTop: "15px",
                        marginTop: "-12.5px",
                        paddingRight: "15px",
                        paddingLeft: "15px",
                        paddingBottom: isExpanded? "10px": "6px",
                        borderWidth: 3,
                        display: "flex",
                        flexDirection: "column", // Set to column
                        alignItems: "center", // Center horizontally
                        overflow: "clip", // Hide overflow
                        cursor: "pointer", // Change cursor to pointer on hover
                        maxHeight: isExpanded ? "none" : "82.5px", // Set max height based on expansion state
                      }}
                      className="overflow-y-scroll overflow-x-hidden"
                      onClick={handleBoxClick} // Toggle expansion on click
                    >
                      {/* Content a  s container */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column", // Change to column for text container
                          alignItems: "flex-start", // Align text to the start
                          textAlign: "left",
                          width: "100%", // Take full width
                          justifyContent: "flex-start", // Align content and image to the start
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {/* Add margin to the bottom of the heading */}
                        <h3 style={{ marginBottom: "2.5px", marginTop: "-2px", whiteSpace: "nowrap" }}>About {stockTicker.toUpperCase()}.</h3>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                          <p style={{ marginTop: "0px", marginBottom: "-2.5px" }}>{stockData["LBS"]}</p>
                        </div>
                      </div>
                    </div>
  
                  ) : (
                    <div></div>
                    )}
                </div>
              }
            </div>
            <div style={{ height: "70%", border: "0px solid black", display: "flex", justifyContent: "center", transform: "translateY(-110px)" }}>
              {
                <div className="content-container" style={{}} >
                  {stockData ? (
                    <Box
                      ref={box3Ref}
                      id={styles.accountCard}
                      sx={{
                        width: "27vw",
                        borderRadius: 3,
                        border: 1,
                        borderColor: "#00000020",
                        marginBottom: '5%',
                        borderWidth: 3,
                        display: 'flex',
                        flexDirection: 'column', // Set to column
                        alignItems: 'center', // Center horizontally
                        padding: '20px', // Add padding
                      }}
                      className="overflow-y-scroll overflow-x-hidden"
                    >
                      {/* Content container */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row", // Set to row
                          alignItems: "flex-start", // Align content to the top
                          textAlign: "left",
                          width: "100%", // Take full width
                          justifyContent: "flex-start", // Align content and image to the start
                        }}
                      >
                        <div style={{ width: "60%", marginRight: '5%' }}> {/* Add right margin for spacing */}
                          <Typography
                            variant="h5"
                            style={{ fontFamily: "Avenir", color: "black", fontSize: "1.75rem", whiteSpace: 'nowrap' }}
                            sx={{
                              marginLeft: "0%",
                              marginBottom: "1%",
                              fontWeight: "bold",
                            }}
                          >
                            Sentiment Analysis Results
                          </Typography>
                          <Divider style={{ borderWidth: '.75px', marginTop: '5px' }} />
                          <p style={{ marginBottom: '-2px', fontWeight: 500, color: '#1976D2' }}>{stockData["Count"]} Articles Analyzed</p>
                          { stockData["Count"] > 0 ? (
                            <div>
                          <p style={{ fontSize: '15px', marginBottom: '-2px', fontWeight: 500 }}>Avg Pos: <span style={{ fontSize: '20px', marginLeft: '5px' }}>{stockData["Pos"].toFixed(7)}</span></p>
                          <p style={{ fontSize: '15px', marginBottom: '-2px', fontWeight: 500 }}>Avg Neu: <span style={{ fontSize: '20px', marginLeft: '5px' }}>{stockData["Neu"].toFixed(7)}</span></p>
                          <p style={{ fontSize: '15px', marginBottom: '10px', fontWeight: 500 }}>Avg Neg: <span style={{ fontSize: '20px', marginLeft: '5px' }}>{stockData["Neg"].toFixed(7)}</span></p>
                          <Divider style={{ borderWidth: '.5px', borderColor: 'black' }} />
                          <p style={{ fontSize: '15px', marginTop: '15px', marginBottom: '0px', fontWeight: 500, whiteSpace: 'nowrap' }}>Total Compound Score: <span style={{ fontSize: '20px', marginLeft: '5px', color: stockData["Compound Score"].toFixed(7) >= 0.05 ? teal[500] : stockData["Compound Score"].toFixed(7) <= -0.05 ? decreasedRed : 'grey' }}>{stockData["Compound Score"].toFixed(7)}</span></p>
                         </div>
                         ) : (
                          <div>
                             <p style={{ fontSize: '15px', marginBottom: '-2px', fontWeight: 500 }}>Sorry! Yahoo Finance News </p>
                             <p style={{ fontSize: '15px', marginBottom: '-2px', fontWeight: 500 }}>API is currently down.</p>
                             <p style={{ fontSize: '15px', marginBottom: '-2px', fontWeight: 500 }}>Unable to grab sentiment :(</p>
                             <p style={{ fontSize: '15px', marginBottom: '-2px', fontWeight: 500 }}>Please check back soon.</p>



                          </div>
                         ) }
                          </div>
  
                        {/* Image section */}
                        {stockData["Overall Sentiment"] === "positive" && (
                          <img src={yourImage} style={{ width: '35%', height: 'auto', marginLeft: '-15px', marginTop: '67.5px' }} />
                        )}
                        {stockData["Overall Sentiment"] === "neutral" && (
                          <img src={yourImage1} style={{ width: '45%', height: 'auto', marginLeft: '-40px', marginTop: '45px' }} />
                        )}
                        {stockData["Overall Sentiment"] === "negative" && (
                          <img src={yourImage2} style={{ width: '40%', height: 'auto', marginLeft: '-30px', marginTop: '57.5px' }} />
                        )}
                      </div>
  
                    </Box>
  
                  ) : (
                    <div></div>
                    )}
                </div>
              }
            </div>
            <div style={{ height: "70%", transform: "translateY(-100px)", border: "0px solid black", display: "flex", justifyContent: "center" }}>
              {
                <div className="flex flex-col mx-8" style={{ transform: "translateY(-60px)" }}>
                  <div
                    className="rounded-3xl border-2 border-gray-200 flex flex-col p-8"
                    id={styles.accountCard}
                  ></div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      marginTop: "5%",
                      justifyContent: "center", // Center the child elements horizontally
                    }}
                  >
                    {stockData ? (
                      <Box
                        ref={box4Ref}
                        id={styles.accountCard}
                        sx={{
                          width: "42.5vw",
                          borderRadius: 3,
                          border: 1,
                          borderColor: "#00000020",
                          marginBottom: '5%',
                          borderWidth: 3,
                        }}
                        className="overflow-y-scroll overflow-x-hidden"
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "left",
                            textAlign: "left",
                            marginRight: "5%",
                            marginLeft: "3.75%",
                            marginTop: "3.5%",
                            marginBottom: "2.5%",
                            width: "90%",
                          }}
                        >
                          <Typography
                            variant="h5"
                            style={{ fontFamily: "Avenir", color: "black", fontSize: "1.75rem", }}
                            sx={{
                              marginLeft: "0%",
                              marginBottom: "1%",
                              fontWeight: "bold",
                            }}
                          >
                            Scraped Articles
                          </Typography>
                          <Divider orientation="horizontal" sx={{ width: "100%" }} />
                          {newsItems
                            .slice(0, showAll ? newsItems.length : 3) // Display all articles if showAll is true, else display 3
                            .map((news, id) => (
                              <HomeNewsRow key={id} news={news} />
                            ))}
                          {newsItems.length > 3 && (
                            <div
                              style={{
                                display: "flex",
                                width: "100%",
                                justifyContent: "center",
                              }}
                            >
                              <Button
                                variant="text"
                                style={{ fontFamily: "Avenir" }}
                                onClick={handleViewToggleClick}
                                sx={{ marginTop: "1%", marginBottom: "-12.5px" }}
                              >
                                {showAll ? "View Less" : "View More"}
                              </Button>
                            </div>
                          )}
                           {newsItems.length === 0 && (
                            <div
                              style={{
                                display: "flex",
                                width: "100%",
                                height:"250px",
                                justifyContent: "center",
                                alignItems:"center",
                              }}
                            >
<div style={{ textAlign: 'center' }}>
  <p style={{ fontWeight: 500, marginBottom: '10px' }}>Sorry, Yahoo Finance News API down, couldn't grab articles :(</p>
  <p style={{ fontWeight: 500 }}>Check back soon!</p>
</div>



                              
                            </div>
                          )}
                        </div>
                      </Box>
                    ) : (
                      <div></div>
                      )}

                  </div>
                </div>
              }
  
            </div>
  
          </div> 
  
        </div>
               ) : (<div style={{ display: "flex", justifyContent: "center",  alignItems: "center", height: "92.75vh", width: "100vw" }}>
               <div style={{marginLeft:"-30px",paddingBottom:"30px"}}>
                 <BouncingDotsLoader />
               </div>
             </div>) }

        </div>  
      </div>

  );
  
  
  
  
  
  
  
  
}

export default ResultsPage;
