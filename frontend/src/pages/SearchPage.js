import React, { useState } from "react";
import { useHistory } from "react-router-dom";

function SearchPage() {
  const [stockTicker, setStockTicker] = useState("");
  const history = useHistory();

  const searchStock = () => {
    // Redirect to the results page with the stock ticker as a query parameter
    history.push(`/results?ticker=${stockTicker}`);
  };

  return (
    <div style={{ fontFamily: "Avenir", color: "black" , textAlign: "center", fontSize: "17px" }}>
      <h1>Stock Search</h1>
      <input
        type="text"
        style={{ fontFamily: "Avenir", color: "black" }}
        placeholder="Enter stock ticker"
        value={stockTicker}
        onChange={(e) => setStockTicker(e.target.value)}
      />
      <button style={{ fontFamily: "Avenir", color: "black" }} onClick={searchStock}>Search</button>
    </div>
  );
}

export default SearchPage;
