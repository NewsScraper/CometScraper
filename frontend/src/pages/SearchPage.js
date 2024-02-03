import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import stockSymbols from "./Symbols.txt"; // Import the TXT directly
import magnifyingGlass from "../components/MagnifyingGlass.jpg";
import { alpha } from "@mui/system";

function SearchPage() {
  const [stockTicker, setStockTicker] = useState("");
  const [originalSuggestions, setOriginalSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [companyNameWidths, setCompanyNameWidths] = useState([]); // Store individual widths
  const [validStockSymbols, setValidStockSymbols] = useState([]); // Store valid stock symbols
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const history = useHistory();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

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