import yfinance as yf
import numpy as np
import pandas as pd
import nltk 
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from bs4 import BeautifulSoup
import requests
from datetime import datetime  # Add this line


#nltk.download('vader_lexicon') # one time only
 # Retrieve the stock ticker from the query parameters
stock_ticker = 'ibrx'

stock = yf.Ticker(stock_ticker)

# show news
news_articles = stock.news
