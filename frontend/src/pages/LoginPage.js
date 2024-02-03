import { Box, TextField, Drawer, Button, CssBaseline, Link, Paper, Grid, Typography } from '@mui/material';
import * as React from 'react';
import "./Login.css";
import { GlassCard } from "../components/GlassCard";
import utdfintechlogo from "../components/utdfintechlogo.png";
import logingraphicblue1 from "../components/logingraphicblue1.png";
import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
//import firebase from '../components/firebase';
//import { auth } from '../components/firebaseAdmin';



function LoginPage() {
    const history = useHistory();
    const [isNewUser, setIsNewUser] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handlePassword = e => {setPassword(e.target.value);}
    const handleEmail = e => {setEmail(e.target.value);};
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const handleLoginPassword = e => {setLoginPassword(e.target.value);}
    const handleLoginEmail = e => {setLoginEmail(e.target.value);};
    const registerNewUser = () => {setIsNewUser((prevState) => !prevState)}

    const loggedIn = () => {
        // Redirect to the results page with the stock ticker as a query parameter
        history.push(`/search`);
      };
    const handleSignUp = () => {
        history.push('/register'); // Navigate to the sign-up page
    };

    return (
        <div style={{ height: '100vh'  }} >
            <Drawer className="custom-grid"
                variant="permanent"
                anchor="left"
                sx={{ }}
                
            >
                <Grid container component="main" className="custom-grid" sx={{ height: '100vh',
                
     }}>
                    <Grid item
                        xs={false}
                        sm={4}
                        md={7}
                        sx={{
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            
                            
                        }}
                    >
                        <Grid item
                            style={{
                                width: "100vw",
                                height: "13vh",
                                display: "flex",
                                flexDirection: "row",
                                paddingLeft:"35px",
                                paddingTop:"35px"
                            }}
                            
                        >
                            <img className="photo" src={utdfintechlogo} style={{width: "62.5px", height: "62.5px"}} />
                            <label className="logoText">
                                Comet
                                <br />
                                Scraper
                            </label>
                            
                        </Grid>
                    
                        <img className="welcomePhoto" src={logingraphicblue1} style={{
                            width: "700px", // Adjust the width as needed
                            height: "auto", // Maintain aspect ratio
                            paddingLeft: "225px", // Adjust left padding as needed
                            paddingTop: "195px", // Adjust top padding as needed
  }}/>
                    </Grid>
                    <Grid item xs={12} sm={8} md={5}  elevation={6} square sx={{ }}>
    <Box className="infoCard" sx={{ paddingLeft:"75px", textAlign: 'left', paddingBottom: "200px",  }}> {/* Aligning content to the center */}
        <Typography variant="h5" className="loginHeader" style={{fontFamily: 'Avenir',fontWeight : 600,}}>
            Welcome Back,
        </Typography>
        <Typography className="lowerLoginHeader" style={{fontFamily: 'Avenir',}}>
            Sign in
        </Typography>
        {isNewUser ? (
                                <Box component="form" noValidate sx={{ mt: 1 }}>
                                    <TextField
                                        value={email}
                                        className={"textField customTextField"}
                                        margin="normal"
                                        required={false}
                                        id="email"
                                        label={<span style={{ fontFamily: 'Avenir' }}>EMAIL ADDRESS</span>}
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                        onChange={handleEmail}
                                        InputProps={{
                                            style: {
                                              borderRadius: "7.5px",
                                            }
                                          }}


                                    />
                                    <br />
                                    <TextField
                                        value={password}
                                        className={"textField"}
                                        margin="normal"
                                        required={false}
                                        name="password"
                                        label={<span style={{ fontFamily: 'Avenir' }}>PASSWORD</span>}
                                        type="password"
                                        id="password"
                                        autoComplete="current-password"
                                        onChange={handlePassword}
                                        InputProps={{
                                            style: {
                                              borderRadius: "7.5px",
                                            }
                                          }}

                                    />
                                    <br />
                                    <TextField
                                        className={"textField"}
                                        margin="normal"
                                        required = {false}
                                        id="first_name"
                                        label={<span style={{ fontFamily: 'Avenir' }}>FIRST NAME</span>}
                                        name="First_Name"
                                        autoComplete="First Name"
                                        InputProps={{
                                            style: {
                                              borderRadius: "7.5px",
                                            }
                                          }}
                                    />
                                    <br />
                                    <TextField
                                        className={"textField"}
                                        margin="normal"
                                        required={false}
                                        name="Last_Name"
                                        label={<span style={{ fontFamily: 'Avenir' }}>LAST NAME</span>}
                                        id="last_name"
                                        autoComplete="Last Name"
                                        InputProps={{
                                            style: {
                                              borderRadius: "7.5px",
                                            }
                                          }}
                                    />
                                    <br />
                                    <Button
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2, fontFamily: 'Avenir' }}
                                        onClick={() => {
                                            const login = email;
                                            const pw = password;

                                        //     firebase
                                        //         .auth()
                                        //         .createUserWithEmailAndPassword(login, pw)
                                        //         .then(({ user }) => {
                                        //             return user.getIdToken().then((idToken) => {

                                        //             });
                                        //         })
                                        //         .then(() => {
                                        //             if(firebase.auth().currentUser){
                                        //                 history.push(`/search`);
                                        // }
                                        //         });
                                            //return false;
                                            // auth.setPersistence(auth.Auth.Persistence.LOCAL);
                                            // const login = email;
                                            // const pw = password;

                                            // auth.createUserWithEmailAndPassword(login, pw)
                                            //     .then(({ user }) => {
                                            //         return user.getIdToken().then((idToken) => {

                                            //         });
                                            //     })
                                            //     .then(() => {
                                            //         if(auth.currentUser){
                                            //             history.push(`/search`);
                                            //         }
                                            //     });
                                            // return false;

                                        }}
                                    >
                                        Create Account
                                    </Button>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="subtitle1" style={{fontFamily: 'Avenir'}}>
                                            Already have an account?
                                        </Typography>
                                        <Button
                                            variant="text"
                                            sx={{ textTransform: 'none' }}
                                            onClick={registerNewUser}
                                        >
                                            <Typography variant="subtitle1" style={{fontFamily: 'Avenir'}}>
                                                Sign In
                                            </Typography>
                                        </Button>
                                    </div>
                                </Box>
                            ) : (
                                <Box component="form" noValidate sx={{ mt: 1 }}>
                                    <TextField
                                        value={loginEmail}
                                        className={"textField"}
                                        margin="normal"
                                        required={false}
                                        id="email"
                                        label={<span style={{ fontFamily: 'Avenir' }}>EMAIL ADDRESS</span>}
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                        onChange={handleLoginEmail}
                                        InputProps={{
                                            style: {
                                              borderRadius: "7.5px",
                                            }
                                          }}
                                    />
                                    <br />
                                    <TextField
                                        value={loginPassword}
                                        className={"textField"}
                                        margin="normal"
                                        required={false}
                                        name="password"
                                        label={<span style={{ fontFamily: 'Avenir' }}>PASSWORD</span>}
                                        type="password"
                                        id="password"
                                        autoComplete="current-password"
                                        onChange={handleLoginPassword}
                                        InputProps={{
                                            style: {
                                              borderRadius: "7.5px",
                                            }
                                          }}

                                    />
                                    <br />
                                    <Button
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2, mr: 5, fontFamily: 'Avenir'}}
                                        onClick={() => {
                                            // firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                                            // const login = loginEmail;
                                            // const pw = loginPassword;
                                            // firebase
                                            //     .auth()
                                            //     .signInWithEmailAndPassword(login, pw)
                                            //     .then(({ user }) => {
                                            //     })
                                            //     .then(() => {
                                            //         if(firebase.auth().currentUser){
                                            //         router.push('/dashboard');
                                            //         }
                                            //     });
                                            // return false;
                                        }}
                                    >
                                        Log In
                                    </Button>
                                    
                                    <Button
                                        variant="contained"
                                        className={"googleLoginButton"}
                                        sx={{ mt: 3, mb: 2, fontFamily: 'Avenir'}}
                                        onClick={() => {
                                            // var provider =
                                            //     new firebase.auth.GoogleAuthProvider();
                                            //     firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                                            // firebase
                                            //     .auth()
                                            //     .signInWithPopup(provider)
                                            //     .then((result) => {
                                            //         console.log(result.user);
                                            //         router.push('/dashboard');
                                            //     })
                                            //     .catch((error) => {
                                            //         console.error(error);
                                            //     });
                                        }}
                                    >
                                        Log In With Google
                                    </Button>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="subtitle1" style={{fontFamily: 'Avenir'}}> 
                                            Don't have an account?
                                        </Typography>
                                        <Button
                                            variant="text"
                                            sx={{ textTransform: 'none' }}
                                            onClick={registerNewUser}
                                        >
                                            <Typography variant="subtitle1" style={{fontFamily: 'Avenir'}}>
                                                Sign Up
                                            </Typography>
                                        </Button>
                                    </div>
                                    <div>
                                        <Button
                                            variant="text"
                                            sx={{
                                                textTransform: 'none',
                                                padding: 0,
                                            }}
                                        >
                                            <Typography variant="subtitle1" style={{fontFamily: 'Avenir'}}>
                                                Forgot your password?
                                            </Typography>
                                        </Button>
                                    </div>
                                </Box>
                            )}
                       
    </Box>
</Grid>

                </Grid>
            </Drawer>
        </div>
    );
}
export default LoginPage;