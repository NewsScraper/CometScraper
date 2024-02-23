import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import ResultsPage from "./pages/ResultsPage";
import "./App.css"; // Import your CSS file here
import LoginPage from "./pages/LoginPage";
import LocationPage from "./pages/LocationPage";
import { Auth } from "./pages/AuthPage";


function App() {
  return (
    <Router>
      <Switch>
      <Route path="/auth">
          <Auth />
        </Route>
        <Route path="/location">
          <LocationPage />
        </Route>
        <Route path="/results">
          <ResultsPage />
        </Route>
        <Route path="/search">
          <SearchPage />
        </Route>
        <Route path="/">
          <LoginPage />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
