import pandas as pd
from bs4 import BeautifulSoup
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf;
import numpy as np
import requests
import lxml.html
from datetime import datetime

