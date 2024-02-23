import { auth, googleAuthProvider } from "../config/firebase";
import { useState, useEffect } from "react";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      console.error(err);
    }
  };

  const signUp = async () => {
    try {
      await auth.createUserWithEmailAndPassword(email, password);
    } catch (err) {
      console.error(err);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await auth.signInWithPopup(googleAuthProvider);
    } catch (err) {
      console.error(err);
    }
  };

  const logOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <input
        placeholder="Email.."
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password.."
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signIn}>Signin</button>
      <button onClick={signUp}>Signup</button>
      <button onClick={signInWithGoogle}>Signin with Google</button>
      <button onClick={logOut}>Log out</button>
      {loggedIn ? <p>You are logged in.</p> : <p>You are logged out.</p>}
    </div>
  );
};
