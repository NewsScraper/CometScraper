import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import ResultsPage from "./pages/ResultsPage";
import "./App.css"; // Import your CSS file here

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/results">
          <ResultsPage />
        </Route>
        <Route path="/">
          <SearchPage />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
