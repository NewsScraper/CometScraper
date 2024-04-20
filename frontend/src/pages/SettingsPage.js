import { Box, TextField, Drawer, Button, CssBaseline, Link, Paper, Grid, Typography } from '@mui/material';
import styles from "../components/home.module.css";
import React, { useState, useEffect, useRef } from "react";
import { database, auth, googleAuthProvider } from "../config/firebase";
import firebase from 'firebase/compat/app';
import { useHistory } from "react-router-dom";
import fintechLogo from "../components/FinTech_logo.png";
import userLogo from "../components/user-128.png";
import sunIcon from '../components/icons8-sun-50.png';
import partlyCloudyIcon from '../components/icons8-partly-cloudy-day-50.png';
import hailIcon from '../components/icons8-hail-50.png';
import snowIcon from '../components/icons8-snow-50.png';
import stormIcon from '../components/icons8-storm-50.png';
import sleetIcon from '../components/icons8-sleet-50.png';
import heavyRainIcon from '../components/icons8-heavy-rain-50.png';
import drizzleIcon from '../components/icons8-light-rain-50.png';
import fogIcon from '../components/icons8-cloud-50.png';
import { padding } from '@mui/system';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

function SettingsPage() {
    const currentDate = new Date();
    const history = useHistory(); // Import and initialize useHistory hook
    const [loggedIn, setLoggedIn] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [weatherImage, setWeatherImage] = useState(null);
    const [closestTemperature, setClosestTemperature] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [resetName, setResetName] = useState("");
    const handleResetName = e => {setResetName(e.target.value);};
    const [resetPassword, setResetPassword] = useState("");
    const handleResetPassword = e => {setResetPassword(e.target.value);};

    const [success, setSuccess] = useState(false);
    const handleSuccess = () => {setSuccess(true)}

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayOfWeek = days[currentDate.getDay()];
    const month = months[currentDate.getMonth()];
    const dayOfMonth = currentDate.getDate();
    const formattedDate = `${dayOfWeek}, ${month} ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)}`;

    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [error, setError] = useState(null);
    const [weatherCode, setWeatherCode] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: ''
    });

    const forgotPassword = () => {setForgotPasswordState((prevState) => !prevState)}
    const [forgotPasswordState, setForgotPasswordState] = useState(false);


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

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleSettings = async () => {
        console.log("settings")
        history.push(`/settings`);
    }

    const handleNameSubmit = async (childNode) => {
        try {
            const user = auth.currentUser;
            if (user) {
                const uid = user.uid;
                // Set user data in the database under the specified child node
                await database.ref(`users/${uid}/firstName`).set(childNode);
                // Optionally, you can fetch the updated data after setting it
                const userSnapshot = await database.ref(`users/${uid}`).once('value');
                const userData = userSnapshot.val();
                // Extract and set the first name to state
                if (userData && userData.firstName) {
                    setFirstName(", " + userData.firstName + "!");
                } else {
                    // Handle case when user data or first name is not available
                }
            }
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    }
    

    const submitResetPassword = async () => {
        handleSuccess();
        try {
            const user = auth.currentUser;
            if (user) {
                const userEmail = user.email;
                await sendPasswordResetEmail(auth, userEmail);
                console.log("Password reset email sent to:", userEmail);

            } else {
                console.log("No user is currently signed in.");
            }
        } catch (error) {
            console.error("Error sending password reset email:", error);
        }
    }
    
    

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            history.push(`/`);
        } catch (err) {
            console.error(err);
        }
    };

    const handleHome = () => {
        history.push(`/search`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // You can handle form submission logic here
        console.log('Form submitted:', formData);
        // Reset form fields after submission
        setFormData({
            firstName: '',
            lastName: ''
        });
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
                                    <hr style={{ width: '100%', margin: '0', borderTop: '1px solid #ccc' }} /> {/* Divider */}
                                    <li style={{ padding: '10px', cursor: 'pointer' }} onClick={handleLogout}>Logout</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Box  sx={{ paddingLeft:"75px", textAlign: 'left', paddingBottom: "100px", paddingTop: "40px", }}> {/* Aligning content to the center */}
            <Button variant="contained"     style={{ backgroundColor: '#ff0a54' }}
 onClick={handleHome} startIcon={<ArrowBackIosIcon />}
>Search</Button>

        <Typography variant="h5" className="loginHeader" style={{fontFamily: 'Avenir',fontWeight : 600, marginTop:"-17.5vh"}}>
                            Welcome{firstName}
        </Typography>
        <br></br>
       
        <Grid container spacing={1}> {/* Adjust spacing as needed */}
    <Grid item xs={3.5}> {/* Adjust the size based on your layout */}
        <Grid container direction="column">
            <Grid item xs={12}>
                <span style={{ fontFamily: 'Avenir' }}>Change Name</span>
            </Grid>
            <Grid item xs={12}>
                <TextField
                    className={"textField customTextField"}
                    value={resetName}
                    margin="normal"
                    required={false}
                    id="resetName"
                    onChange={handleResetName}
                    label={<span style={{ fontFamily: 'Avenir' }}>Name</span>}
                    name="name"
                    autoComplete="name"
                    autoFocus
                    InputProps={{
                        style: {
                            borderRadius: "7.5px",
                        }
                    }}
                />
<Button variant="contained" style={{ marginTop:"10px", backgroundColor: '#00827f' }} onClick={() => handleNameSubmit(resetName)} startIcon={<ArrowUpwardIcon />}>
Submit</Button>
            </Grid>
        </Grid>
    </Grid>
    <div style={{paddingTop:"57.5px", marginLeft:"-65px"}}>

    <Button
        onClick={ submitResetPassword}
        variant="text"
        sx={{
            textTransform: 'none',
            padding: '0px', // Adjust padding as needed
        }}
        >
            { !success?(
        <Typography variant="subtitle1" style={{ fontFamily: 'Avenir', whiteSpace: 'nowrap' }}>
             Forgot your password? 
        </Typography>
            ) :
            <Typography variant="subtitle1" style={{ fontFamily: 'Avenir', whiteSpace: 'nowrap' }}>
             Reset Password Email Sent!
        </Typography>
}
     </Button>
     </div>







</Grid>
                            
                       
    </Box>
        </div>

        
    );

}

export default SettingsPage;
