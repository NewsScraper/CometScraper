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

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayOfWeek = days[currentDate.getDay()];
  const month = months[currentDate.getMonth()];
  const dayOfMonth = currentDate.getDate();

  const formattedDate = `${dayOfWeek}, ${month} ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)}`;


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
    if (stockTicker) {
      fetch(`http://127.0.0.1:5000/sentiment?ticker=${stockTicker}`)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw Error("Network response was not ok.");
        })
        .then((sentimentData) => {
          setStockData(sentimentData);
          console.log(sentimentData);
          // Update newsItems here
          if (sentimentData && sentimentData["Articles"]) {
            setNewsItems(
              sentimentData["Articles"].map((article) => {
                const { title, score, href, info, date } = article; // Extract title score and href from the article object
                return {
                  title,
                  date: date, 
                  source: info, 
                  href,
                  score,
                };
              })
            );
          }
          console.log(sentimentData["Close Prices"])
          if (sentimentData && sentimentData["Close Prices"]) {
            setClosePrices(sentimentData["Close Prices"]);
          }
          drawChart(closePrices);
        
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [stockTicker, closePrices]);

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
            break;
        case '5d':
            // Handle 5 day interval
            break;
        case '1m':
            // Handle 1 month interval
            break;
        case '6m':
            // Handle 6 month interval
            break;
        case '1y':
            // Handle 1 year interval
            break;
        case '5y':
            // Handle 5 year interval
            const temp = closePrices.slice(-1825);
            drawChart(closePrices);
            break;
        case 'max':
            // Handle maximum interval
            drawChart(closePrices);
            break;
        default:
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      history.push(`/`);
    } catch (err) {
      console.error(err);
    }
  };

  const drawChart = (prices) => {
    if (prices && prices.length > 0) {
        const ctx = chartRef.current.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: prices.map((_, index) => index + 1),
                datasets: [{
                    label: 'Closing Prices',
                    data: prices,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }
};


  return (
    <div className="custom-grid">
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", backgroundColor: "transparent" }}>
  <div style={{ display: "flex", alignItems: "center", paddingRight: "20px" }}>
    {/* Text and image to the left */}
    <Typography
                      variant="h5"
                      style={{ fontFamily: "Avenir", color: "black", fontSize: "1.75rem",  whiteSpace: 'nowrap'}}
                      sx={{
                        marginLeft: "10px",
                        marginRight: "17.5px",
                        fontWeight : "bold",
                      }}
                    >
                      CometScraper
                    </Typography>
    <img src={fintechLogo} alt="Logo" style={{ width: "100px", height: "35px", borderRadius: "0%" }} />
  </div>
  <div style={{ display: "flex", alignItems: "center" } }>
    
    {/* Text and circular image as profile image to the right */}
    <div style={{ display: "flex", alignItems: "center" }}>
  <p style={{fontWeight:500, margin: "0", fontFamily: "Avenir", color: "black" }}>
    Welcome{firstName}
  </p>
  <div style={{ borderLeft: "1px solid black", height: "25px", marginLeft: "10px", marginRight: "10px" , marginBottom:"2.5px" }}></div>
  <p style={{fontWeight:500, margin: "0", fontFamily: "Avenir", color: "black" , marginRight: "12.5px"}}>
    {formattedDate}
  </p>
  {weatherImage && (
                                <div>
                                    <img  src={weatherImage} alt="Weather" style={{width:"30px", height:"30px", marginRight:"5px",marginTop:"0em"}}/>
                                </div>
                            )}
  {closestTemperature && (
                        
                            <p style={{ fontWeight:500, margin: "0", fontFamily: "Avenir", color: "black", marginRight: "15px" }}>{closestTemperature.temperature}° F</p>
                       
                    )}
</div>
    <div style={{ position: 'relative' }}>
      <img
        src={userLogo}
        alt="Profile"
        style={{ width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer" , marginRight:"10px"}}
        onClick={toggleDropdown}
      />
      {dropdownVisible && (
  <div id={styles.dropDown} style={{ fontFamily:"Avenir", position: 'absolute', top: '40px', right: '0', border: "1px solid",
  borderColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '5px'}}>
    <ul style={{ listStyleType: 'none', margin: '0', padding: '0' }}>
      <li style={{ padding: '10px', cursor: 'pointer' }}>Settings</li>
      <hr style={{ width: '100%', margin: '0', borderTop: '1px solid #ccc' }} /> {/* Divider */}
      <li style={{ padding: '10px', cursor: 'pointer' }} onClick={handleLogout}>Logout</li>
    </ul>
  </div>
)}

    </div>
  </div>
</div>

    
    <div style={{ fontFamily: "Avenir", color: "black", textAlign: "center", height: "100vh", display: "flex", flexDirection: "column", paddingTop: "20px" }}>
      <div style={{ height: "calc(100% - 50px)", display: "grid", gridTemplateRows: "1fr 1fr", gridTemplateColumns: "1fr 1fr", gap: "0px" }}>
        <div style={{ border: "0px solid black", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {
            <div className="content-container">
            {stockData ? (
              <Box
              id={styles.accountCard}
              sx={{
                width: "fit-content", // Adjust the width as needed
                borderRadius: 3,
                border: "2px solid #00000020",
                borderColor: "#00000020",
                marginBottom: '5%',
                borderWidth: 3,
                padding: '10px', // Add padding
                display: 'flex',
                alignItems: 'center', // Center the content vertically
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
                      <p style={{ fontSize: "22px", whiteSpace: 'nowrap', marginBottom: '10px', marginTop:'15px' }}>
                        {stockData["Value"].toFixed(2)}  <span style={{ fontSize: '15px', color: grey[600] }}>USD</span>
                      </p>
                      <p style={{ fontSize: "16px", whiteSpace: 'nowrap', marginBottom: '10px', marginTop:'-5px', marginLeft: '-5px' , color: stockData["dChange"].toFixed(2) < 0 ? decreasedRed : teal[500]}}>
                        {stockData["dChange"] > 0 ? `+${stockData["dChange"].toFixed(2)}` : stockData["dChange"].toFixed(2)} ({Math.abs(stockData["pChange"]).toFixed(2)}%)
                      </p>
                    </div>
                  )}
                </div>
              </div>
             </Box>
              
            ) : (
              <p>Loading...</p>
            )}
          </div>
          }
        </div>
        <div style={{ border: "0px solid black", padding: "0px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {
            <div className="content-container">
            {stockData ? (
              <div
              id={styles.accountCard}
              style={{
                  width: "47.5vw",
                  borderRadius: 10,
                  border: "2px solid #00000020",
                  borderColor: "#00000020",
                  paddingTop: "9.5px",
                  marginTop: "-12.5px",
                  paddingRight: "15px",
                  borderWidth: 3,
                  display: "flex",
                  flexDirection: "column", // Set to column
                  alignItems: "center", // Center horizontally
                  padding: "15px", // Add padding
                  overflow: "hidden", // Hide overflow
                  cursor: "pointer", // Change cursor to pointer on hover
                  maxHeight: isExpanded ? "none" : "82.5px", // Set max height based on expansion state
              }}
              className="overflow-y-scroll overflow-x-hidden"
              onClick={handleBoxClick} // Toggle expansion on click
          >
              {/* Content container */}
              <div
                  style={{
                      display: "flex",
                      flexDirection: "column", // Change to column for text container
                      alignItems: "flex-start", // Align text to the start
                      textAlign: "left",
                      width: "100%", // Take full width
                      justifyContent: "flex-start", // Align content and image to the start
                      overflow: "scroll",
                      textOverflow: "ellipsis" 
                  }}
              >
                  {/* Add margin to the bottom of the heading */}
                  <h3 style={{ marginBottom: "2.5px", marginTop: "-3px", whiteSpace: "nowrap" }}>About {stockTicker.toUpperCase()}.</h3>
                  <div style={{ overflow: "scroll", textOverflow: "ellipsis" }}>
                      <p style={{ marginTop: "0px" , marginBottom: "-2.5px"}}>{stockData["LBS"]}</p>
                  </div>
                </div>
              </div>
              
            ) : (
              <p>Loading...</p>
            )}
          </div>
          }
        </div>
        <div style={{ border: "0px solid black", paddingTop: "0px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {
            <div className="content-container">
              {stockData ? (
                <Box
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
                      style={{ fontFamily: "Avenir", color: "black", fontSize: "1.75rem",  whiteSpace: 'nowrap'}}
                      sx={{
                        marginLeft: "0%",
                        marginBottom: "1%",
                        fontWeight : "bold",
                      }}
                    >
                      Sentiment Analysis Results
                    </Typography>
                      <Divider style={{ borderWidth: '.75px', marginTop: '5px'}}/>
                      <p style={{ marginBottom: '-2px' , fontWeight: 500, color: '#1976D2'}}>{stockData["Count"]} Articles Analyzed</p>
                      <p style={{ fontSize: '15px', marginBottom: '-2px' , fontWeight: 500}}>Avg Pos: <span style={{ fontSize: '20px', marginLeft: '5px' }}>{ stockData["Pos"].toFixed(7)}</span></p>
                      <p style={{ fontSize: '15px', marginBottom: '-2px' , fontWeight: 500}}>Avg Neu: <span style={{ fontSize: '20px' , marginLeft: '5px' }}>{ stockData["Neu"].toFixed(7)}</span></p>
                      <p style={{ fontSize: '15px',marginBottom: '10px', fontWeight: 500}}>Avg Neg: <span style={{ fontSize: '20px' , marginLeft: '5px'}}>{ stockData["Neg"].toFixed(7)}</span></p>
                      <Divider style={{ borderWidth: '.5px', borderColor: 'black' }} />
                      <p style={{fontSize: '15px', marginTop: '15px', marginBottom: '0px', fontWeight: 500, whiteSpace: 'nowrap' }}>Total Compound Score: <span style={{ fontSize: '20px' , marginLeft: '5px',  color: stockData["Compound Score"].toFixed(7) >= 0.05 ? teal[500] : stockData["Compound Score"].toFixed(7) <= -0.05 ? decreasedRed : 'grey' }} >{stockData["Compound Score"].toFixed(7)}</span></p>
                    </div>
                
                    {/* Image section */}
                    {stockData["Overall Sentiment"] === "positive" && (
                      <img src={yourImage} style={{ width: '35%', height: 'auto', marginLeft: '-15px' , marginTop: '67.5px' }} />
                    )}
                    {stockData["Overall Sentiment"] === "neutral" && (
                      <img src={yourImage1} style={{ width: '45%', height: 'auto', marginLeft: '-40px' , marginTop: '45px' }} />
                    )}
                    {stockData["Overall Sentiment"] === "negative" && (
                      <img src={yourImage2} style={{ width: '40%', height: 'auto', marginLeft: '-30px' , marginTop: '57.5px' }} />
                    )}
                  </div>

                  <div>
  <h2>Price Chart</h2>
  <canvas ref={chartRef} width="400" height="200"></canvas>
  <div style={{ marginTop: '5px' }}>
    <ButtonGroup variant="contained" aria-label="time-intervals">
      <Button onClick={() => handleTimeInterval('1d')} style={buttonStyle}>1d</Button>
      <Button onClick={() => handleTimeInterval('5d')} style={buttonStyle}>5d</Button>
      <Button onClick={() => handleTimeInterval('1m')} style={buttonStyle}>1m</Button>
      <Button onClick={() => handleTimeInterval('6m')} style={buttonStyle}>6m</Button>
      <Button onClick={() => handleTimeInterval('1y')} style={buttonStyle}>1y</Button>
      <Button onClick={() => handleTimeInterval('5y')} style={buttonStyle}>5y</Button>
      <Button onClick={() => handleTimeInterval('max')} style={{ ...buttonStyle, borderRight: 'none' }}>Max</Button>
    </ButtonGroup>
  </div>
</div>
                  
                </Box>
                
              ) : (
                <p>Loading...</p>
              )}
            </div>
          }
        </div>
        <div style={{ border: "0px solid black", padding: "0px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {
            <div className="flex flex-col mx-8">
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
                        fontWeight : "bold",
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
                  </div>
                </Box>
                 ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          }
        </div>
      </div>
    </div>
    </div>
  );
  
  
  
  
  
  
  
}

export default ResultsPage;
