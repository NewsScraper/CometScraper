import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "../components/home.module.css";
import { Box } from "@mui/system";
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
import ActivityRow from "../ActivityRow";
import HomeNewsRow from "../components/HomeNewsRow";

function ResultsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const stockTicker = searchParams.get("ticker");
  const [stockData, setStockData] = useState(null);
  const [newsItems, setNewsItems] = useState([]); // Define state for newsItems
  const [showAll, setShowAll] = useState(false); // Toggle between showing all articles or not

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
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [stockTicker]);

  const handleViewToggleClick = () => {
    setShowAll(!showAll);
  };

  return (
    <div style={{ fontFamily: "Avenir", color: "black", textAlign: "center" }}>
      <div className="content-container">
        <h1>Results for {stockTicker}</h1>
        {stockData ? (
          <div>
            <p>Stock: {stockData["Stock"]} </p>
            <p>
              Value: ${stockData["Value"].toFixed(2)}   
               {' '}{stockData["dChange"].toFixed(2)}({Math.abs(stockData["pChange"]).toFixed(2)}%)
            </p>
            <p>{stockData["LBS"]}</p>
            <p># of Articles Scraped: {stockData["Count"]}</p>
            <p>Avg Neg: {stockData["Neg"].toFixed(7)}</p>
            <p>Avg Neu: {stockData["Neu"].toFixed(7)}</p>
            <p>Avg Pos: {stockData["Pos"].toFixed(7)}</p>
            <p>Avg Compound Score: {stockData["Compound Score"].toFixed(7)}</p>
            <p>Overall News Sentiment: {stockData["Overall Sentiment"]}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
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
          <Box
            id={styles.accountCard}
            sx={{
              width: "42.5vw",
              borderRadius: 10,
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
                marginLeft: "5%",
                marginTop: "3.5%",
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
                    sx={{ marginTop: "1%", marginBottom: "1%" }}
                  >
                    {showAll ? "View Less" : "View More"}
                  </Button>
                </div>
              )}
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
