import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import stockSymbols from "./Symbols.txt"; // Import the TXT directly
import magnifyingGlass from "../components/MagnifyingGlass.jpg";
import { useLocation } from "react-router-dom";
import { alpha } from "@mui/system";
import styles from "../components/home.module.css";
import firebase from 'firebase/compat/app';

import yourImage from '../components/face-png-42654.png';
import yourImage2 from '../components/sad-6485840_1280.png';
import yourImage1 from '../components/laq6inkc58lo1do6so8toa8m9d.png';
import upArrow from "../components/upArrow.png";
import downArrow from "../components/downArrow.png";
import fintechLogo from "../components/FinTech_logo.png";
import { teal, pink , red, grey} from "@mui/material/colors";
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
import userLogo from "../components/user-128.png";

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

function SearchPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [stockTicker, setStockTicker] = useState("");
  const [originalSuggestions, setOriginalSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [companyNameWidths, setCompanyNameWidths] = useState([]); // Store individual widths
  const [validStockSymbols, setValidStockSymbols] = useState([]); // Store valid stock symbols
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const history = useHistory();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const currentDate = new Date();
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [error, setError] = useState(null);
  const [closestTemperature, setClosestTemperature] = useState(null);
  const [weatherCode, setWeatherCode] = useState(null);
  const [weatherImage, setWeatherImage] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [firstName, setFirstName] = useState('');
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

  // Fetch suggestions from Symbols.txt on component mount
  useEffect(() => {
    
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(stockSymbols);
        const data = await response.text();
        const symbolsArray = data.split('\n').map(line => line.trim());
        setOriginalSuggestions(symbolsArray);
        const stockNames = symbolsArray.map(line => line.split(',')[0].trim()); // Extracting the first part as the stock name
        setValidStockSymbols(stockNames); // Set valid stock symbols
      } catch (error) {
        console.error('Error fetching stock symbols:', error);
      }
    };

    fetchSuggestions();
  }, []); // Fetch suggestions on component mount

  

  // Function to handle outside click
  const handleClickOutside = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target) && suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
      setFilteredSuggestions([]); // Clear suggestions if click is outside input and suggestions box
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      history.push(`/`);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
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

  const searchStock = () => {
    // Check if the entered stock ticker is valid
    const isValidStock = validStockSymbols.includes(stockTicker.toUpperCase());

    // Redirect to the results page only if the entered stock ticker is valid
    if (isValidStock) {
      history.push(`/results?ticker=${stockTicker}`);
    } else {
      setErrorMessage("Invalid stock ticker. Please enter a valid stock symbol.");
      // Clear suggestions when error message appears
      setFilteredSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setStockTicker(inputValue);
    setErrorMessage(""); // Clear error message on input change
  
    // Filter suggestions based on user input
    let filteredSuggestions = [];
  
    // Show suggestions only if input value is not empty
    if (inputValue.trim() !== "") {
      filteredSuggestions = originalSuggestions
        .filter(line => line.toLowerCase().startsWith(inputValue.toLowerCase()))
        .sort((a, b) => a.length - b.length); // Sort by the length of the stock names

        const lowerCaseInput = inputValue.toLowerCase();
        const exactMatchIndex = originalSuggestions.findIndex(line => {
          // Extract the first string from each line
          const firstString = line.split(',')[0].trim().toLowerCase();
          return firstString === lowerCaseInput;
        });

        if(exactMatchIndex !== -1){
          const exactMatch = originalSuggestions[exactMatchIndex];

          // Remove any duplicates of the exact match from filteredSuggestions
          filteredSuggestions = filteredSuggestions.filter(item => item !== exactMatch);

          // Add the exact match to the beginning of filteredSuggestions
          filteredSuggestions.unshift(exactMatch);
        }
  
      // Show only the top 5 most common suggestions
      filteredSuggestions = filteredSuggestions.slice(0, 5);
    }

    setFilteredSuggestions(filteredSuggestions);
  };

  const handleSuggestionClick = (symbol) => {
    setStockTicker(symbol);
  };

  const handleKeyPress = (e) => {
    // Check if the Enter key is pressed
    if (e.key === 'Enter') {
      searchStock(); // Trigger search
    }
  };

  useEffect(() => {
    // Calculate and set the width of the longer word in pixels between company name and sector for each suggestion
    const widths = filteredSuggestions.map(line => {
      const [_, companyName, sector] = line.split(',').map(part => part.trim());
      const companyWidth = getTextWidth(companyName, '12px Avenir');
      const sectorWidth = getTextWidth(sector, '12px Avenir');
      return Math.max(companyWidth, sectorWidth);
    });
    setCompanyNameWidths(widths);
  }, [filteredSuggestions]);

  // Function to calculate text width
  const getTextWidth = (text, font) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const width = context.measureText(text).width;
    return width;
  };

  return (
    <div className= "custom-grid" style={{height:"100vh", fontFamily: "Avenir", color: "black", textAlign: "center", fontSize: "17px", position: "relative" }}>
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
                                    <img  src={weatherImage} alt="Weather" style={{width:"30px", height:"30px", marginRight:"5px", marginTop:"0em"}}/>
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
      <h1>Comet Scraper</h1>
      <div style={{ position: "relative", display: "inline-block" }}>
        <input
          ref={inputRef}
          type="text"
          style={{
            fontFamily: "Avenir",
            color: "black",
            width: "325px",
            height: "40px",
            borderRadius: "8px",
            paddingLeft: "40px",
            paddingRight: "40px", // Adjusted padding for the button
            border: "1px solid #ccc",
            outline: "none",
            backgroundImage: `url(${magnifyingGlass})`,
            backgroundSize: "15px", // Adjust size of the magnifying glass
            backgroundPosition: "10px center", // Position the magnifying glass
            backgroundRepeat: "no-repeat",
            borderBottomLeftRadius: filteredSuggestions.length > 0 ? "0" : "8px", // Bottom left corner not rounded when suggestions are present
            borderBottomRightRadius: filteredSuggestions.length > 0 ? "0" : "8px", // Bottom right corner not rounded when suggestions are present
          }}
          placeholder="Enter stock ticker"
          value={stockTicker}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress} // Add key press event handler
        />
        <button
          style={{
            fontFamily: "Avenir",
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            backgroundColor: validStockSymbols.includes(stockTicker.toUpperCase()) ? "#00827E" : "#ccc",
            color: "#fff",
            outline: "none",
            height: "24px",
            borderRadius: "5px",
            lineHeight: "24px",
          }}
          onClick={searchStock}
        >
          Search
        </button>
      </div>

      {errorMessage && <p style={{ color: alpha("#ff0000", 0.675), marginTop: "10px" }}>{errorMessage}</p>} {/* Render error message if present */}

      {filteredSuggestions.length > 0 && !errorMessage && (
        <div ref={suggestionsRef} className="suggestions" style={{  width: `calc(${inputRef.current ? inputRef.current.offsetWidth : 0}px)`, zIndex: 1, left: 0, top: "40px", display: "block", borderTopLeftRadius: "8px", borderTopRightRadius: "8px"
        ,  left: 0,
        right: 0,
        margin: "auto",}}>
          {filteredSuggestions.map((line, index) => {
            const [symbol, companyName, sector] = line.split(',').map(part => part.trim());
            const isBottomMost = index === filteredSuggestions.length - 1;
            const nextSuggestion = filteredSuggestions[index + 1];
            const thinBorder = nextSuggestion && nextSuggestion.split(',')[0].toLowerCase() !== symbol.toLowerCase();
            const suggestionWidth = companyNameWidths[index] || 200; // Default width if not yet calculated
            return (
              <div key={symbol} onClick={() => handleSuggestionClick(symbol)} style={{ cursor: "pointer", border: `1px solid #ccc`, backgroundColor: "#fff", lineHeight: "1.5"
              , display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px"
              , borderBottomLeftRadius: isBottomMost ? "8px" : 0, borderBottomRightRadius: isBottomMost ? "8px" : 0, borderBottomWidth: isBottomMost ? "2px" : (thinBorder ? "0.5px" : "1px") }}>
                <div style={{ width: "40%", textAlign: "left", fontWeight: "bold", fontSize: "16px", marginLeft: '12px' }}>{symbol}</div>
                <div style={{ width: `${suggestionWidth}px`, textAlign: "right", fontSize: "12px", marginRight:'12px' }}>
                  <div>{companyName}</div>
                  <div style={{ borderTop: "1px solid #ccc", paddingTop: "2px" }}>{sector}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchPage;