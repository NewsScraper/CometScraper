import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import stockSymbols from "./Symbols.txt"; // Import the TXT directly
import magnifyingGlass from "../components/MagnifyingGlass.jpg";
import { useLocation } from "react-router-dom";
import { alpha } from "@mui/system";
import styles from "../components/home.module.css";
import firebase from 'firebase/compat/app';
import blackRecommendations from "../components/BlackRecommendations.png";
import greyRecommendations from "../components/GreyRecommendations.png";
import yourImage from '../components/face-png-42654.png';
import yourImage2 from '../components/sad-6485840_1280.png';
import yourImage1 from '../components/laq6inkc58lo1do6so8toa8m9d.png';
import CoolUpArrow from "../components/CoolUpArrow1.png";
import CoolDownArrow from "../components/CoolDownArrow1.png";
import Watchlist from "../components/watchlist.png";
import greyWatchlist from "../components/greywatchlist.png";

import OffCoolUpArrow from "../components/OffCoolUpArrow.png";
import OffCoolDownArrow from "../components/OffCoolDownArrow.png";
import sentimentViewBlack from "../components/sentimentViewBlack.png";
import sentimentViewGrey from "../components/sentimentViewGrey.png";

import { Box } from "@mui/system"
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
import Chart from 'chart.js/auto';
import eyeSymbol from "../components/EyeSymbol.png";

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
import BouncingDotsLoader from "../components/BouncingDotsLoader";

const decreasedRed = alpha("#ff0000", 0.675);

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
 const [stockInfoData, setstockInfoData] = useState(null)
 const [trendingArray, setTrendingArray] = useState([]);
 const [losingArray, setLosingArray] = useState([]);
 const [trendingLoading, setTrendingLoading] = useState(true);
 const [losingLoading, setLosingLoading] = useState(true);
 const [topRowVisible, setTopRowVisible] = useState(false);
 const [bottomRowVisible, setBottomRowVisible] = useState(false);
 const [watchlistVisible, setWatchlistVisible] = useState(false);
 const [sentimentViewVisible, setSentimentViewVisible] = useState(false);
 const chartRef = useRef(null); // Reference to the chart canvas element
 const [isGraphVisible, setIsGraphVisible] = useState(false); // State to track if the graph is visible
 const [loadChart, setLoadChart] = useState(false);
 const [heldIndex, setHeldIndex] = useState(null);

 const [watchlistLoading, setWatchlistLoading] = useState(true);
 const [recommendations, setRecommendations] = useState([]);
 const [recommendationsVisible, setRecommendationsVisible] = useState(false);

const handleRecommendationsClick = () => {
  setTopRowVisible(false);
  setBottomRowVisible(false);
  setWatchlistVisible(false);
  setSentimentViewVisible(false);
  setRecommendationsVisible(!recommendationsVisible);
 };


 const [fetchSuccess, setFetchSuccess] = useState(false);
 const [recommendationsLoading, setRecommendationsLoading] = useState(true);

const handleSentimentViewClick = () => {
  setTopRowVisible(false);
  setBottomRowVisible(false);
  setWatchlistVisible(false);
  setRecommendationsVisible(false);
  setSentimentViewVisible(!sentimentViewVisible);
  setLoadChart(true);
};
 const [watchlistArray, setWatchlistArray] = useState([]);


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
 const name1 = user.displayName;
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
 if (userData && userData.watchlist) {
 setWatchlistArray(userData.watchlist);
 setWatchlistLoading(false);
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
  const fetchData = async () => {
    if (loadChart) {
      try {
        const user = auth.currentUser;
        if (user) {

          // Get user data from the database
          const userSnapshot = await database.ref(`sentiment/${stockTicker.toUpperCase()}`).once('value');
          const userData = userSnapshot.val();
          // Extract and set the first name to state
          if (userData && Object.keys(userData).length !== 0) {
            console.log("goog" + userData);
            const monthlyClosePrices1 = userData;
            drawChart(monthlyClosePrices1, "Date");
          }
          else {
            const monthlyClosePrices1 = [["good",,"null"]
            ];
            drawChart(monthlyClosePrices1, "Sorry No Stored Sentiment Values, Check Back Soon");
        } 
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
    if(!stockTicker){
      const monthlyClosePrices1 = [["good",,"09-12-2024"]
    ];
    drawChart(monthlyClosePrices1, "Sorry No Stored Sentiment Values, Check Back Soon");
    }
    setLoadChart()
  };

  fetchData();
}, [sentimentViewVisible, loadChart]);


 
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

 const drawChart = (prices, title) => {
  if (!chartRef.current) {
    console.error("Canvas reference is null");
    return;
  }
  if (prices && prices.length > 0) {
    const ctx = chartRef.current.getContext('2d');
    let myChart = chartRef.current.myChart; // Get the reference to the previous chart instance

    // Destroy the previous chart instance if it exists
    if (myChart) {
      myChart.destroy();
    }

    myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: prices.map(price => formatDate(price[2])), // Use custom formatDate function to format date
        datasets: [{
          label: 'Sentiment',
          data: prices.map(price => price[1]), // Use price as data (assuming price is at index 1)
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
              display: true, // Display the title for the y-axis
              text: 'Sentiment', // Title text
            },
          },
        },
        // Your chart options
        plugins: {
          legend: {
            display: false // Hide the legend
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.dataset.data[context.dataIndex]; // Get the value of the hovered point
                let sentimentType;
                if (value >= 0.05) {
                  sentimentType = 'positive';
                } else if (value <= -0.05) {
                  sentimentType = 'negative';
                } else {
                  sentimentType = 'neutral';
                }
                return `Sentiment: ${value} ${sentimentType}`;
              }
            }
          }
        }
      }
    });

    chartRef.current.myChart = myChart; // Store the reference to the new chart instance
  }
};


// Custom function to format date in 'YYYY-MM-DD' format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  let month = '' + (date.getMonth() + 1);
  let day = '' + date.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};



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
  if(sentimentViewVisible){
    setLoadChart(true);

  }
  else{
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
}
 };

 


 const addToWatchlist = async (item) => {
 // Create a new array by spreading the existing watchlistArray and appending the new item
 const updatedArray = [...watchlistArray, item];
 // Set the state with the updated array
 setWatchlistArray(updatedArray);
 };
 
 useEffect(() => {
 const uploadToDatabase = async () => {
  await updateWatchlistArray();

 try {

 const user = await auth.currentUser;
 if (user && watchlistArray.length > 0) { // Check if watchlistArray is not empty
 const uid = user.uid;
 // Upload the updated watchlistArray to the database
 await database.ref(`users/${uid}/watchlist`).set(watchlistArray);
 console.log('Success');
 }
 } catch (error) {
 console.error('Error updating user data:', error);
 }
 };

 document.body.style.overflow = 'hidden';
 
 // Call uploadToDatabase whenever watchlistArray changes
 uploadToDatabase();
 }, [watchlistArray]); 

 const addStock = async () => {
 // Check if the entered stock ticker is valid
 const isValidStock = validStockSymbols.includes(stockTicker.toUpperCase());
 const trendingValues = [];
 // Redirect to the results page only if the entered stock ticker is valid
 
if (isValidStock ) {
 const stockInfoResponse = await fetch(`http://127.0.0.1:5000/stock_info?ticker=${stockTicker}`);
 if (!stockInfoResponse.ok) {
 throw new Error(`Failed to fetch stock info for ${stockTicker}`);
 }
 
 const stockInfoData = await stockInfoResponse.json();
 console.log(`Stock: ${stockInfoData.Stock}`);
 console.log(`Value: ${stockInfoData.Value}`);
 console.log(`Change in Dollars: ${stockInfoData.dChange}`);
 console.log(`Percent Change: ${stockInfoData.pChange}`);


 trendingValues.push(
 stockInfoData.Stock.toUpperCase(),
 parseFloat(stockInfoData.Value), // Convert to integer
 parseFloat(stockInfoData.dChange), // Convert to integer
 parseFloat(stockInfoData.pChange) // Convert to integer
 );


 addToWatchlist(trendingValues); // Set trendingArray state
 
 
 setWatchlistLoading(false);


 
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
 }

 );

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
 setFilteredSuggestions([]); // Close the dropdown
 };
 
 const handleKeyPress = (e) => {
 // Check if the Enter key is pressed
 if (e.key === 'Enter') {
 searchStock(); // Trigger search
 setFilteredSuggestions([]); // Close the dropdown
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

 useEffect(() => {
        const fetchTrendingData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/trending');
                if (!response.ok) {
                    throw new Error('Failed to fetch trending data');
                }
                const data = await response.json();

                const trendingArray = data.Trending;
                const losingArray = data.Losing;

                const trendingValues = [];
                const losingValues = [];

                for (let i = 0; i < Math.min(8, trendingArray.length); i++) {
                    const stock = trendingArray[i];
                    const stockInfoResponse = await fetch(`http://127.0.0.1:5000/stock_info?ticker=${stock}`);
                    if (!stockInfoResponse.ok) {
                        throw new Error(`Failed to fetch stock info for ${stock}`);
                    }
                    const stockInfoData = await stockInfoResponse.json();

                    trendingValues.push([
                        stockInfoData.Stock,
                        parseFloat(stockInfoData.Value),
                        parseFloat(stockInfoData.dChange),
                        parseFloat(stockInfoData.pChange)
                    ]);
                }

                for (let i = 0; i < Math.min(8, losingArray.length); i++) {
                    const stock = losingArray[i];
                    const stockInfoResponse = await fetch(`http://127.0.0.1:5000/stock_info?ticker=${stock}`);
                    if (!stockInfoResponse.ok) {
                        throw new Error(`Failed to fetch stock info for ${stock}`);
                    }
                    const stockInfoData = await stockInfoResponse.json();

                    losingValues.push([
                        stockInfoData.Stock,
                        parseFloat(stockInfoData.Value),
                        parseFloat(stockInfoData.dChange),
                        parseFloat(stockInfoData.pChange)
                    ]);
                }

                setTrendingArray(trendingValues);
                setLosingArray(losingValues);
                setTrendingLoading(false);
                setLosingLoading(false);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchTrendingData();
    }, []);

    useEffect(() => {
      const fetchRecommendations = async () => {
          try {
              // Convert the array of arrays to a string and encode it for URL
              const encodedArrayOfArrays = encodeURIComponent(JSON.stringify(watchlistArray));
      
              console.log(watchlistArray);
              console.log(encodedArrayOfArrays);
      
              // Make the fetch request with the encoded array of arrays in the URL
              const watchlistResponse = await fetch(`http://127.0.0.1:5000/recommendations?arrayOfArrays=${encodedArrayOfArrays}`);
      
              if (!watchlistResponse.ok) {
                  throw new Error('Failed to fetch recommendations with watchlist');
              }
      
              // Since the server returns a plain array, just parse the response
              const watchlistData = await watchlistResponse.json();
              setRecommendations(watchlistData);
              setFetchSuccess(true);
              setRecommendationsLoading(false);
              // Log the fetched array
          } catch (error) {
              console.error('Error fetching recommendations with watchlist:', error);
          }
      };
  
      // Call the fetchRecommendations function when the component mounts or when watchlistArray changes
      if (!fetchSuccess) {
        fetchRecommendations();
    }
  }, [watchlistArray, fetchSuccess]); // This will run whenever watchlistArray changes
  
  
  
 const handleSettings = async () => {
 history.push(`/settings`)
 }

 const calculateDropdownTop = () => {
 const inputHeight = inputRef.current ? inputRef.current.offsetHeight : 0;
 const dropdownOffset = -42; // Adjust this value to change the dropdown position
 return inputHeight + inputRef.current.getBoundingClientRect().top + window.scrollY + dropdownOffset;
 };

 const handleBoxClick = (index) => {
  
  if(topRowVisible){
    const temp = trendingArray[index].toString();
const stockTicker = temp.substring(0, temp.indexOf(','))
 console.log(`Searching for stock: ${stockTicker}`);
 // Navigate to the results page with the stock ticker
 history.push(`/results?ticker=${stockTicker}`);
  }
  if(bottomRowVisible){
    const temp = losingArray[index].toString();
const stockTicker = temp.substring(0, temp.indexOf(','))
 console.log(`Searching for stock: ${stockTicker}`);
 // Navigate to the results page with the stock ticker
 history.push(`/results?ticker=${stockTicker}`);
    
  }
 };
 

 const handleBothBoxClickUp = (index) => {
  
    const temp = trendingArray[index].toString();
const stockTicker = temp.substring(0, temp.indexOf(','))
 console.log(`Searching for stock: ${stockTicker}`);
 // Navigate to the results page with the stock ticker
 history.push(`/results?ticker=${stockTicker}`);
  
 };
 const handleBothBoxClickDown = (index) => {
  
  const temp = losingArray[index].toString();
const stockTicker = temp.substring(0, temp.indexOf(','))
console.log(`Searching for stock: ${stockTicker}`);
// Navigate to the results page with the stock ticker
history.push(`/results?ticker=${stockTicker}`);

};

const handleWatchlistBoxClick = (index) => {
  
const stockTicker = watchlistArray[index][0];
console.log(`Searching for stock: ${stockTicker}`);
// Navigate to the results page with the stock ticker
history.push(`/results?ticker=${stockTicker}`);

};



 const handleCoolUpArrowClick = () => {
 setTopRowVisible((prevVisible) => !prevVisible);
 setWatchlistVisible(false);
 setRecommendationsVisible(false);
 setSentimentViewVisible(false);
 };

 const handleCoolDownArrowClick = () => {
 setBottomRowVisible((prevVisible) => !prevVisible);
 setWatchlistVisible(false);
 setRecommendationsVisible(false);
 setSentimentViewVisible(false);



 };

 const handleWatchlistClick = () => {
 setTopRowVisible(false);
 setBottomRowVisible(false);
 setWatchlistVisible((prevVisible) => !prevVisible);
 setRecommendationsVisible(false);
 setSentimentViewVisible(false);

 };

 const handleCloseClick = (index) => {
  // Code to handle the click event
  console.log('Close icon clicked for card at index:', index);
  
  // Remove the entry at the specified index from the watchlistArray
  setWatchlistArray(prevArray => {
    const newArray = [...prevArray];
    newArray.splice(index, 1);
    return newArray;
  });
};

const handleAddClick = async (index) => {
  try {
      // Code to handle the click event
      console.log('Eye symbol clicked for card at index:', index);
      
      // Extract the recommendation data from the recommendations array based on the index
      const recommendationToAdd = recommendations[index];

      // Add the recommendation data to the watchlistArray
      setWatchlistArray(prevArray => [...prevArray, recommendationToAdd]);

      // Remove the recommendation at the clicked index from the recommendations array
      setRecommendations(prevRecommendations => prevRecommendations.filter((_, i) => i !== index));

      // Encode the watchlistArray as a query parameter
      const encodedArrayOfArrays = encodeURIComponent(JSON.stringify(watchlistArray));
      
      let newRecommendationFound = false;
      let parsedSingleRecommendation;

      // Loop until a new recommendation is found
      while (!newRecommendationFound) {
          // Fetch a single recommendation from the backend
          const singleRecommendationResponse = await fetch(`http://127.0.0.1:5000/SingleRecommendation?arrayOfArrays=${encodedArrayOfArrays}`);
          
          // Check if the response is successful
          if (!singleRecommendationResponse.ok) {
              throw new Error('Failed to fetch single recommendation');
          }

          // Parse the JSON response
          const singleRecommendationData = await singleRecommendationResponse.json();
          
          // Ensure that the data is parsed as an array
          parsedSingleRecommendation = Array.isArray(singleRecommendationData) ? singleRecommendationData : [singleRecommendationData];
          
          // Check if the fetched recommendation is not already in recommendations
          if (!recommendations.some(rec => rec === parsedSingleRecommendation)) {
              newRecommendationFound = true;
          }
      }
      
      // Update the recommendations state with the fetched single recommendation
      setRecommendations(prevRecommendations => [...prevRecommendations, ...parsedSingleRecommendation]);
      
      console.log('Fetched single recommendation:', parsedSingleRecommendation);
      console.log('Updated recommendations:', recommendations);
  } catch (error) {
      console.error('Error handling add click and fetching single recommendation:', error);
  }
};

const handleBoxHold = (index) => {
  console.log(`Box held: ${index}`);
  // Add your logic for "on hold" action here
};


const updateWatchlistArray = async () => {
  try {
    // Ensure watchlistArray is an array
    

    for (let i = 0; i < watchlistArray.length; i++) {
      const stockInfoResponse = await fetch(`http://127.0.0.1:5000/stock_info?ticker=${watchlistArray[i][0]}`);
      
      
      
      const stockInfoData = await stockInfoResponse.json();
      watchlistArray[i][0] = stockInfoData.Stock;
      watchlistArray[i][1] = stockInfoData.Value;
      watchlistArray[i][2] = stockInfoData.dChange;
      watchlistArray[i][3] = stockInfoData.pChange;
      console.log(watchlistArray[i]);
    }

    // Update the UI or trigger other actions as needed
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('An error occurred while updating the watchlist array:', error);
  }
};
const handleRecommendationBoxClick = (index) => {
 
  const stockTicker = recommendations[index][0];
  console.log(`Searching for stock: ${stockTicker}`);
  // Navigate to the results page with the stock ticker
  history.push(`/results?ticker=${stockTicker}`);
  
  };

  const onMouseDown = (index) => {
    setHeldIndex(index);
    setTimeout(() => {
      if (heldIndex === index) {
        handleBoxHold(index);
      }
    }, 500); // 1000 milliseconds (1 second) for "on hold"
  };

  const onMouseUp = () => {
    setHeldIndex(null);
    // Clear the hold timer when mouse button is released
    clearTimeout();
  };




 
 return (
 <div id="scrollContainer" className="custom-grid" style={{ height: "100vh", fontFamily: "Avenir", color: "black", textAlign: "center", fontSize: "17px", position: "relative", overflowY: "auto" }}>
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", backgroundColor: "transparent" }}>
 <div style={{ display: "flex", alignItems: "center", paddingRight: "20px", }}>
 {/* Text and image to the left */}
 <Typography
 variant="h5"
 style={{ fontFamily: "Avenir", color: "black", fontSize: "1.75rem", whiteSpace: 'nowrap' }}
 sx={{
 marginLeft: "10px",
 marginRight: "17.5px",
 fontWeight: "bold",
 }}
 >
 CometScraper
 </Typography>
 <img src={fintechLogo} alt="Logo" style={{ width: "100px", height: "35px", borderRadius: "0%" }} />
 </div>
 <div style={{ display: "flex", alignItems: "center" , marginTop:"-.5px"}}>
 {/* Text and circular image as profile image to the right */}
 <div style={{ display: "flex", alignItems: "center" }}>
 <p style={{ fontWeight: 500, margin: "0", fontFamily: "Avenir", color: "black", fontSize: "17px" }}>
 Welcome{firstName}
 </p>
 <div style={{ borderLeft: "1px solid black", height: "25px", marginLeft: "10px", marginRight: "10px", marginBottom: "2.5px" }}></div>
 <p style={{ fontWeight: 500, margin: "0", fontFamily: "Avenir", color: "black", marginRight: "12.5px" , fontSize: "17px"}}>
 {formattedDate}
 </p>
 {weatherImage && (
 <div style={{paddingTop:"0px"}}>
                  <img src={weatherImage}  style={{width: "30px", height: "30px", marginRight: "9px", marginTop: "2px" }} />
 </div>
 )}
 {closestTemperature && (
 <p style={{ fontWeight: 500, margin: "0", fontFamily: "Avenir", color: "black", marginRight: "15px" , fontSize:"17px"}}>{closestTemperature.temperature}° F</p>
 )}
 </div>
 <div style={{ position: 'relative', zIndex: '1000',}}> {/* Adjusted zIndex */}
 <img
 src={userLogo}
 alt="Profile"
 style={{ width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer", marginRight: "10px", paddingTop:"2px" }}
 onClick={toggleDropdown}
 />
 {dropdownVisible && (
    <div id={styles.dropDown} style={{ fontFamily: "Avenir", position: 'absolute', top: `${calculateDropdownTop()-4}px`, right: '0', border: "1px solid", borderColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '5px', zIndex: '1001', marginTop: "-315%", width: '195%', height: '225%' }}> {/* Adjusted width */}
        <ul style={{ listStyleType: 'none', margin: '0', padding: '0', fontSize: '16px' }}> {/* Adjusted font size */}
            <li style={{ padding: '10px', cursor: 'pointer', paddingTop: '13%' }} onClick={handleSettings}>Settings</li> {/* Added paddingTop */}
            <hr style={{ width: '100%', margin: '0', borderTop: '1px solid #ccc' }} /> {/* Divider */}
            <li style={{ padding: '10px', cursor: 'pointer', paddingTop: '13%' }} onClick={handleLogout}>Logout</li> {/* Added paddingTop */}
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
 {!watchlistVisible ? (
  <button
    style={{
      fontFamily: "Avenir",
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      border: "none",
      backgroundColor: validStockSymbols.includes(stockTicker.toUpperCase()) && stockTicker ? "#00827E" : !stockTicker? "#ccc": "#fff",
      color: "#fff",
      outline: "none",
      height: "24px",
      borderRadius: "5px",
      lineHeight: "24px",
      cursor: validStockSymbols.includes(stockTicker.toUpperCase()) ? "pointer" : "default", // Change cursor to pointer when it's a valid stock ticker
    }}
    onClick={searchStock}
  >
    Search
  </button>
) : (
  <button
    style={{
      fontFamily: "Avenir",
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      border: "none",
      backgroundColor: watchlistArray.some(item => item[0] === stockTicker.toUpperCase()) ? "#ccc" : validStockSymbols.includes(stockTicker.toUpperCase()) && stockTicker ? "#00827E" : !stockTicker? "#ccc": "#fff",
      "#ccc": "#ccc",
      color: "#fff",
      outline: "none",
      height: "24px",
      borderRadius: "5px",
      lineHeight: "24px",
      cursor: watchlistArray.some(item => item[0] === stockTicker.toUpperCase()) || !validStockSymbols.includes(stockTicker.toUpperCase()) ? "default" : "pointer", // Add cursor styling conditionally
    }}
    onClick={() => {
      if (!watchlistArray.some(item => item[0] === stockTicker.toUpperCase()) && validStockSymbols.includes(stockTicker.toUpperCase())) {
        addStock(); // Call the addStock function first
        setTimeout(() => {
          const scrollContainer = document.getElementById('scrollContainer');
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }, 100); // Adjust the delay time as neededs
      }
    }}
  >
    Add
  </button>
  )}
 </div>
 
 <div>
 

 {
 topRowVisible? (
 <img className="" onClick={handleCoolUpArrowClick} src={CoolUpArrow} style={{
 width: "35px", // Adjust the width as needed
 height: "auto", // Maintain aspect ratio
 paddingLeft: "0px", // Adjust left padding as needed
 paddingTop: "10px", // Adjust top padding as needed
 cursor: "pointer" // Set cursor to pointer
 }} /> ) : 
 <img className="" onClick={handleCoolUpArrowClick} src={OffCoolUpArrow} style={{
 width: "35px", // Adjust the width as needed
 height: "auto", // Maintain aspect ratio
 paddingLeft: "0px", // Adjust left padding as needed
 paddingTop: "10px", // Adjust top padding as needed
 cursor: "pointer" // Set cursor to pointer
 }} />
 }
 {
 bottomRowVisible? (
 <img className="" onClick={handleCoolDownArrowClick} src={CoolDownArrow} style={{
 width: "35px", // Adjust the width as needed
 height: "auto", // Maintain aspect ratio
 paddingLeft: "10px", // Adjust left padding as needed
 paddingTop: "10px", // Adjust top padding as needed
 cursor: "pointer" // Set cursor to pointer
 }} /> ) : 
 <img className="" onClick={handleCoolDownArrowClick} src={OffCoolDownArrow} style={{
 width: "35px", // Adjust the width as needed
 height: "auto", // Maintain aspect ratio
 paddingLeft: "10px", // Adjust left padding as needed
 paddingTop: "10px", // Adjust top padding as needed
 cursor: "pointer" // Set cursor to pointer
 }} />
 }
 
 {
 watchlistVisible? (
 <img className="" onClick={handleWatchlistClick} src={Watchlist} style={{
 width: "35px", // Adjust the width as needed
 height: "auto", // Maintain aspect ratio
 paddingLeft: "10px", // Adjust left padding as needed
 paddingTop: "10px", // Adjust top padding as needed
 cursor: "pointer" // Set cursor to pointer
 }} /> ) : 
 <img className="" onClick={handleWatchlistClick} src={greyWatchlist} style={{
 width: "35px", // Adjust the width as needed
 height: "auto", // Maintain aspect ratio
 paddingLeft: "10px", // Adjust left padding as needed
 paddingTop: "10px", // Adjust top padding as needed
 cursor: "pointer" // Set cursor to pointer
 }} />
 }

{
 recommendationsVisible? (
 <img className="" onClick={handleRecommendationsClick} src={blackRecommendations} style={{
 width: "40px", // Adjust the width as needed
 height: "auto", // Maintain aspect ratio
 paddingLeft: "5px", // Adjust left padding as needed
 paddingTop: "5px", // Adjust top padding as needed
 cursor: "pointer" // Set cursor to pointer
 }} /> ) : 
 <img className="" onClick={handleRecommendationsClick} src={greyRecommendations} style={{
 width: "40px", // Adjust the width as needed
 height: "auto", // Maintain aspect ratio
 paddingLeft: "5px", // Adjust left padding as needed
 paddingTop: "5px", // Adjust top padding as needed
 cursor: "pointer" // Set cursor to pointer
 }} />
 }

 {
  sentimentViewVisible? (
    <img className="" onClick={handleSentimentViewClick} src={sentimentViewBlack} style={{
    width: "35px", // Adjust the width as needed
    height: "auto", // Maintain aspect ratio
    paddingLeft: "8px", // Adjust left padding as needed
    paddingTop: "0px", // Adjust top padding as needed
    cursor: "pointer" // Set cursor to pointer
    }} /> ) : 
    <img className="" onClick={handleSentimentViewClick} src={sentimentViewGrey} style={{
    width: "35px", // Adjust the width as needed
    height: "auto", // Maintain aspect ratio
    paddingLeft: "8px", // Adjust left padding as needed
    paddingTop: "0px", // Adjust top padding as needed
    cursor: "pointer" // Set cursor to pointer
    }} />
 }
 </div>

 {topRowVisible ? (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: '2%', marginLeft: '10%', marginRight: '10%' }}>
    { !trendingLoading? (trendingArray.slice(0, topRowVisible && bottomRowVisible ? 4 : 8).map((stock, index) => (
      <div key={index}onMouseDown={() => onMouseDown(index)}
      onMouseUp={() => onMouseUp()} onClick={() => topRowVisible && bottomRowVisible ? handleBothBoxClickUp(index) : handleBoxClick(index)} style={{ position: 'relative', marginTop: index >= 4 ? '32px' : '0px' }}>
        {(index === 3) && (
          <div style={{ position: 'absolute', top: '-13%', left: '-290%', zIndex: '100', fontSize: "14.5px" }}>
            <h2>TOP GAINERS</h2>
          </div>
        )}
        <Box
          key={index}
          id={styles.accountCard}
          sx={{
            width: '90%',
            borderRadius: 3,
            border: '2px solid #00000020',
            borderColor: '#00000020',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            }}
          className="overflow-y-scroll overflow-x-hidden"
          style={{ height: '100px', width: '75%', marginLeft: '9%', marginTop: '11%' }}
        >
          <div>
          {/* Content container */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '9px', marginBottom: '8px', marginRight: '20px' }}>            {/* First Column (Stock Name) */}
            <div style={{ marginTop: '-8px' }}>
 <div style={{ marginLeft: '20px' }}>
 <h1 style={{ fontSize: '23px', marginBottom: 0 , paddingRight:"7.5px"}}>
                  {stock[0]}
                </h1>
              </div>
            </div>
            {/* Arrow */}
            <div style={{ marginTop: '6px', marginLeft: '-2.5px' }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {parseFloat(stock[2]) > 0 && (
 <img src={upArrow} alt="Up Arrow" style={{marginLeft: "-5px", paddingBottom: "5px", paddingRight:"2.5px", height: "40px", width: "auto" }} />
 )}
 {parseFloat(stock[2]) === 0 && (
 <div   style={{marginLeft: "-5px", paddingBottom: "5px", paddingRight:"2.5px", height: "40px", width: "20px" }} />
 )}
                {parseFloat(stock[2]) < 0 && (
 <img src={downArrow} alt="Down Arrow" style={{ marginLeft: "-2.5px", paddingBottom: "3.5px",height: "40px", width: "auto" }} />
 )}
              </div>
            </div>
            {/* Third Column (Value, dChange, and pChange) */}
            <div style={{ marginLeft: '2px', marginTop: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <p style={{ fontSize: '20px', whiteSpace: 'nowrap', marginBottom: '10px', marginTop: '-2.8px', marginLeft: '-5px' }}>
                  {`${parseFloat(stock[1]).toFixed(2)} `}
                  <span style={{ color: 'grey', fontSize: '14px' }}>USD</span>
                </p>
                <p style={{

 fontSize: '15px',
 whiteSpace: 'nowrap',
 marginBottom: '10px',
 marginTop: '-9px',
 marginLeft: '-5px',
                  color: parseFloat(stock[2]) < 0 ? decreasedRed : teal[500]
                }}>
                  {`${parseFloat(stock[2]).toFixed(2)} (${parseFloat(stock[3]).toFixed(2)}%)`}
                </p>
              </div>
            </div>
          </div>
          </div>
        </Box>
      </div>
    ))) : (Array.from({ length: topRowVisible&&bottomRowVisible? 4: 8 }).map((_, index) => (
      <div key={index}  style={{ position: 'relative', marginTop: index >= 4 ? '32px' : '0px' }}>
        {(index === 3) && (
          <div style={{ position: 'absolute', top: '-13%', left: '-290%', zIndex: '100', fontSize: "14.5px" }}>
            <h2>TOP GAINERS</h2>
          </div>
        )}
        <Box
          key={index}
          id={styles.accountCard}
          sx={{
            width: '90%',
            borderRadius: 3,
            border: '2px solid #00000020',
            borderColor: '#00000020',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            }}
          className="overflow-y-scroll overflow-x-hidden"
          style={{ height: '100px', width: '75%', marginLeft: '9%', marginTop: '11%' }}
        >
          <div style={{paddingTop: "40px",}}>          <BouncingDotsLoader></BouncingDotsLoader>
</div>
        </Box>
      </div>
    )))}
  </div>
) : (<div></div>) }
 
 {/* Render first row of boxes if topRowVisible is true */}
 {bottomRowVisible ? (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: '2%', marginLeft: '10%', marginRight: '10%' }}>
    { !losingLoading? (losingArray.slice(0, topRowVisible && bottomRowVisible ? 4 : 8).map((stock, index) => (
      <div key={index} onClick={() => topRowVisible && bottomRowVisible ? handleBothBoxClickUp(index) : handleBoxClick(index)} style={{ position: 'relative', marginTop: index >= 4 ? '32px' : bottomRowVisible && topRowVisible? '1.7px': '0px' }}>
        {(index === 3) && (
          <div style={{ position: 'absolute', top: '-13%', left: '-290%', zIndex: '100', fontSize: "14.5px" }}>
            <h2>TOP LOSERS</h2>
          </div>
        )}
        <Box
          key={index}
          id={styles.accountCard}
          sx={{
            width: '90%',
            borderRadius: 3,
            border: '2px solid #00000020',
            borderColor: '#00000020',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            }}
          className="overflow-y-scroll overflow-x-hidden"
          style={{ height: '100px', width: '75%', marginLeft: '9%', marginTop: '11%' }}
        >
          <div>
          {/* Content container */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '9px', marginBottom: '8px', marginRight: '20px' }}>            {/* First Column (Stock Name) */}
            <div style={{ marginTop: '-8px' }}>
 <div style={{ marginLeft: '20px' }}>
 <h1 style={{ fontSize: '23px', marginBottom: 0 , paddingRight:"7.5px"}}>
                  {stock[0]}
                </h1>
              </div>
            </div>
            {/* Arrow */}
            <div style={{ marginTop: '6px', marginLeft: '-2.5px' }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {parseFloat(stock[2]) > 0 && (
 <img src={upArrow} alt="Up Arrow" style={{marginLeft: "-5px", paddingBottom: "5px", paddingRight:"2.5px", height: "40px", width: "auto" }} />
 )}
 {parseFloat(stock[2]) === 0 && (
 <div   style={{marginLeft: "-5px", paddingBottom: "5px", paddingRight:"2.5px", height: "40px", width: "20px" }} />
 )}
                {parseFloat(stock[2]) < 0 && (
 <img src={downArrow} alt="Down Arrow" style={{ marginLeft: "-2.5px", paddingBottom: "3.5px",height: "40px", width: "auto" }} />
 )}
              </div>
            </div>
            {/* Third Column (Value, dChange, and pChange) */}
            <div style={{ marginLeft: '2px', marginTop: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <p style={{ fontSize: '20px', whiteSpace: 'nowrap', marginBottom: '10px', marginTop: '-2.8px', marginLeft: '-5px' }}>
                  {`${parseFloat(stock[1]).toFixed(2)} `}
                  <span style={{ color: 'grey', fontSize: '14px' }}>USD</span>
                </p>
                <p style={{

 fontSize: '15px',
 whiteSpace: 'nowrap',
 marginBottom: '10px',
 marginTop: '-9px',
 marginLeft: '-5px',
                  color: parseFloat(stock[2]) < 0 ? decreasedRed : teal[500]
                }}>
                  {`${parseFloat(stock[2]).toFixed(2)} (${parseFloat(stock[3]).toFixed(2)}%)`}
                </p>
              </div>
            </div>
          </div>
          </div>
        </Box>
      </div>
    ))) : (Array.from({ length: topRowVisible&&bottomRowVisible? 4: 8 }).map((_, index) => (
      <div key={index} style={{ position: 'relative', marginTop: index >= 4 ? '32px' : bottomRowVisible && topRowVisible? '1.7px': '0px' }}>
        {(index === 3) && (
          <div style={{ position: 'absolute', top: '-13%', left: '-290%', zIndex: '100', fontSize: "14.5px" }}>
            <h2>TOP LOSERS</h2>
          </div>
        )}
        <Box
          key={index}
          id={styles.accountCard}
          sx={{
            width: '90%',
            borderRadius: 3,
            border: '2px solid #00000020',
            borderColor: '#00000020',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            }}
          className="overflow-y-scroll overflow-x-hidden"
          style={{ height: '100px', width: '75%', marginLeft: '9%', marginTop: '11%' }}
        >
          <div style={{paddingTop: "40px",}}>          <BouncingDotsLoader></BouncingDotsLoader>
</div>
        </Box>
      </div>
    )))}
  </div>
) : (<div></div>) }


{watchlistVisible ? (
 <div style={{ textAlign: 'left' , paddingLeft: "12.1%", paddingTop:"1.2vh",fontSize: "14.5px"}}>
 <h2>WATCHLIST</h2>
 </div>
) : (
 <div></div>
)}

{watchlistVisible && (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: '2.69%', marginLeft: '10%', marginRight: '10%' }}>
    {watchlistArray.map((_, index) => (
      <div key={index} onClick={() =>{handleWatchlistBoxClick(index)}} style={{ position: 'relative', paddingBottom: "100px", marginTop: '-34.7px' }}>
        {/* Box component for the first row */}
        <Box
          key={index}
          id={styles.accountCard}
          sx={{
            width: '90%',
            borderRadius: 3,
            border: '2px solid #00000020',
            borderColor: '#00000020',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            position: 'relative', // Add this line to make the position relative
          }}
          className="overflow-y-scroll overflow-x-hidden"
          style={{ height: '100px', width: '75%', marginLeft: '9%' }}
          // Add the following CSS to show and hide the red x icon
          onMouseEnter={(e) => { e.currentTarget.querySelector('.close-icon').style.display = 'block'; }}
          onMouseLeave={(e) => { e.currentTarget.querySelector('.close-icon').style.display = 'none'; }}
          onClick={() => handleBoxClick(index)} // New onClick handler for the box
        >
          {/* Close icon */}
<div className="close-icon" style={{ position: 'absolute', top: '5px', right: '5px', display: 'none', color: '#ff0000', cursor: 'pointer', fontSize: '20px' }} onClick={(e) => { e.stopPropagation(); handleCloseClick(index); }}>
  &#10006;
</div>

          {/* Content container */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '9px', marginBottom: '8px', marginRight: '20px' }}>
            {watchlistLoading ? (
              <h1>Loading...</h1>
            ) : (
              <>
                {/* First Column (Stock Name) */}
                <div style={{ marginTop: '-8px' }}>
                  <div style={{ marginLeft: '20px' }}>
                    <h1 style={{ fontSize: '23px', marginBottom: 0 , paddingRight:"7.5px"}}>
                      {watchlistArray[index][0]}
                    </h1>
                  </div>
                </div>
                {/* Arrow */}
                <div style={{ marginTop: '6px', marginLeft: '-2.5px' }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {parseFloat(watchlistArray[index][2]) > 0 && (
                      <img src={upArrow} alt="Up Arrow" style={{marginLeft: "-5px", paddingBottom: "5px", paddingRight:"2.5px", height: "40px", width: "auto" }} />
                    )}
                    {parseFloat(watchlistArray[index][2]) === 0 && (
 <div   style={{marginLeft: "-5px", paddingBottom: "5px", paddingRight:"2.5px", height: "40px", width: "20px" }} />
 )}
                    {parseFloat(watchlistArray[index][2]) < 0 && (
                      <img src={downArrow} alt="Down Arrow" style={{ marginLeft: "-2.5px", paddingBottom: "3.5px",height: "40px", width: "auto" }} />
                    )}
                  </div>
                </div>
                {/* Third Column (Value, dChange, and pChange) */}
                <div style={{ marginLeft: '0px', marginTop: '19px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: '20px', whiteSpace: 'nowrap', marginBottom: '10px', marginTop: '-2.8px', marginLeft: '-5px' }}>
                      {`${parseFloat(watchlistArray[index][1]).toFixed(2)} `}
                      <span style={{ color: 'grey', fontSize: '13.5px' }}>USD</span>
                    </p>
                    <p style={{
                      fontSize: '15px',
                      whiteSpace: 'nowrap',
                      marginBottom: '10px',
                      marginTop: '-9px',
                      marginLeft: '-5px',
                      color: parseFloat(watchlistArray[index][3]) < 0 ? decreasedRed : teal[500]
                    }}>
                      {`${parseFloat(watchlistArray[index][2]).toFixed(2)} (${parseFloat(watchlistArray[index][3]).toFixed(2)}%)`}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Box>
      </div>
    ))}
  </div>
)}

{sentimentViewVisible && (
  <div>
<h2>{stockTicker ? `${stockTicker}'s Sentiment Over Time` : 'Sentiment Over Time'}</h2>


  
  <div style={{ display: "flex", justifyContent: "center" , paddingTop:"00px" , }}>
  <Box
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
  <div>
    <canvas  ref={chartRef} width="650" height="325"></canvas>
    <div style={{ marginTop: '5px' }}>
      
    </div>
  </div>
</Box>
</div>
</div>
  
)}

{recommendationsVisible ? (
 <div style={{ textAlign: 'left' , paddingLeft: "12.1%", paddingTop:"1.2vh",fontSize: "14.5px"}}>
 <h2>RECOMMENDATIONS</h2>
 </div>
) : (
 <div></div>
)}

{recommendationsVisible ? (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: '1.45%', marginLeft: '10%', marginRight: '10%' }}>
        {recommendations.slice(0, 8).map((stock, index) => (
            <div key={index} style={{ position: 'relative', marginTop: index >= 4 ? '32px' : '-40px' , paddingBottom:"9px"}}>
                <Box
                    key={index}
                    id={styles.accountCard}
                    sx={{
                        width: '90%',
                        borderRadius: 3,
                        border: '2px solid #00000020',
                        borderColor: '#00000020',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        position: 'relative', // Add this line to make the position relative
                    }}
                    className="overflow-y-scroll overflow-x-hidden"
                    style={{ height: '100px', width: '75%', marginLeft: '9%', marginTop: '8%' }}
                    // Add the following CSS to show and hide the red x icon
                    onMouseEnter={(e) => { e.currentTarget.querySelector('.eye-symbol').style.display = 'block'; }}
                    onMouseLeave={(e) => { e.currentTarget.querySelector('.eye-symbol').style.display = 'none'; }}
                    onClick={() => handleRecommendationBoxClick(index)} // New onClick handler for the box
                >
                    {/* Eye symbol */}
                    <div className="eye-symbol" style={{ position: 'absolute', top: '5px', right: '5px', display: 'none', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); handleAddClick(index); }}>
                        <img src={eyeSymbol} alt="Eye Symbol" style={{ width: '27.75px', height: '21px' }} />
                    </div>

                    {/* Content container */}
                    <div>
                        {/* Content container */}
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '9px', marginBottom: '8px', marginRight: '20px' }}>
                            {/* First Column (Stock Name) */}
                            <div style={{ marginTop: '-8px' }}>
                                <div style={{ marginLeft: '20px' }}>
                                    <h1 style={{ fontSize: '23px', marginBottom: 0, paddingRight: "7.5px" }}>
                                        {stock[0]}
                                    </h1>
                                </div>
                            </div>
                            {/* Arrow */}
                            <div style={{ marginTop: '6px', marginLeft: '-2.5px' }}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    {parseFloat(stock[2]) > 0 && (
                                        <img src={upArrow} alt="Up Arrow" style={{ marginLeft: "-5px", paddingBottom: "5px", paddingRight: "2.5px", height: "40px", width: "auto" }} />
                                    )}
                                    {parseFloat(stock[2]) === 0 && (
                                        <div style={{ marginLeft: "-5px", paddingBottom: "5px", paddingRight: "2.5px", height: "40px", width: "20px" }} />
                                    )}
                                    {parseFloat(stock[2]) < 0 && (
                                        <img src={downArrow} alt="Down Arrow" style={{ marginLeft: "-2.5px", paddingBottom: "3.5px", height: "40px", width: "auto" }} />
                                    )}
                                </div>
                            </div>
                            {/* Third Column (Value, dChange, and pChange) */}
                            <div style={{ marginLeft: '2px', marginTop: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <p style={{ fontSize: '20px', whiteSpace: 'nowrap', marginBottom: '10px', marginTop: '-2.8px', marginLeft: '-5px' }}>
                                        {`${parseFloat(stock[1]).toFixed(2)} `}
                                        <span style={{ color: 'grey', fontSize: '14px' }}>USD</span>
                                    </p>
                                    <p style={{
                                        fontSize: '15px',
                                        whiteSpace: 'nowrap',
                                        marginBottom: '10px',
                                        marginTop: '-9px',
                                        marginLeft: '-5px',
                                        color: parseFloat(stock[2]) < 0 ? decreasedRed : teal[500]
                                    }}>
                                        {`${parseFloat(stock[2]).toFixed(2)} (${parseFloat(stock[3]).toFixed(2)}%)`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Box>
            </div>
        ))}
        {Array.from({ length: 8 - recommendations.length }).map((_, index) => {
  // Calculate the total number of rendered boxes including the new ones
  const totalRenderedBoxes = recommendations.length + index;

  // Calculate the marginTop based on the total number of rendered boxes
  let marginTop;
  if (recommendations.length === 7) {
    marginTop = '-13.25%'; // Set marginTop to '8%' when only one box is rendered
  } else {
    marginTop = totalRenderedBoxes >= 4 ? '32px' : '-40px'; // Calculate marginTop as before
  }

  return (
    <div key={index} style={{ position: 'relative', marginTop: marginTop, paddingBottom: "9px" }}>
      <Box
        key={index}
        id={styles.accountCard}
        sx={{
          width: '90%',
          borderRadius: 3,
          border: '2px solid #00000020',
          borderColor: '#00000020',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          position: 'relative', // Add this line to make the position relative
        }}
        className="overflow-y-scroll overflow-x-hidden"
        style={{ height: '100px', width: '75%', marginLeft: '9%', marginTop: `${8 - recommendations.length === 1 ? 31.75 : 8}%` }}
        // Add the following CSS to show and hide the red x icon
      >
        <div style={{ paddingTop: "40px" }}>
          <BouncingDotsLoader></BouncingDotsLoader>
        </div>
      </Box>
    </div>
  );
})}
    </div>
) : (<div></div>)}

  
 


 
 
 
 {/* Render suggestions if present */}
 {filteredSuggestions.length > 0 && !errorMessage && (
 <div ref={suggestionsRef} className="suggestions" style={{ width: `calc(${inputRef.current ? inputRef.current.offsetWidth : 0}px)`, zIndex: 1001, left: 0, top: `${calculateDropdownTop() + 40}px`, display: "block", borderTopLeftRadius: "8px", borderTopRightRadius: "8px",  right: 0, margin: "auto", position: 'absolute' }}>
 {filteredSuggestions.map((line, index) => {
 const [symbol, companyName, sector] = line.split(',').map(part => part.trim());
 const isBottomMost = index === filteredSuggestions.length - 1;
 const nextSuggestion = filteredSuggestions[index + 1];
 const thinBorder = nextSuggestion && nextSuggestion.split(',')[0].toLowerCase() !== symbol.toLowerCase();
 const suggestionWidth = companyNameWidths[index] || 200; // Default width if not yet calculated
 return (
 <div key={symbol} onClick={() => handleSuggestionClick(symbol)} style={{ cursor: "pointer", border: `1px solid #ccc`, backgroundColor: "#fff", lineHeight: "1.5", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px", borderBottomLeftRadius: isBottomMost ? "8px" : 0, borderBottomRightRadius: isBottomMost ? "8px" : 0, borderBottomWidth: isBottomMost ? "2px" : (thinBorder ? "0.5px" : "1px") }}>
 <div style={{ width: "40%", textAlign: "left", fontWeight: "bold", fontSize: "16px", marginLeft: '12px' }}>{symbol}</div>
 <div style={{ width: `${suggestionWidth}px`, textAlign: "right", fontSize: "12px", marginRight: '12px' }}>
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
};

export default SearchPage;