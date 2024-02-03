import numpy as np
import pandas as pd
import yfinance as yf
import firebase_admin
from firebase_admin import db
import json
from firebase_admin import credentials

tickers = pd.read_html('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies')[0][['Symbol', 'Security', 'GICS Sector']]

commodities = pd.read_html('https://finance.yahoo.com/commodities/')[0][['Symbol', 'Name']]

tickers['Symbol'] = tickers['Symbol'].str.strip()
tickers['Symbol_and_Security'] = tickers.apply(lambda row: [row['Symbol'], row['Security']], axis=1)
sector_company_pairs_grouped = tickers.groupby('GICS Sector')['Symbol_and_Security'].apply(list)
sector_company_pairs_grouped

commodities['Symbol'] = commodities['Symbol'].str.strip()  # Clean 'Symbol' column
commodities_pairs = commodities.apply(lambda row: [row['Symbol'], row['Name']], axis=1).tolist()
sector_company_pairs_grouped['Futures'] = commodities_pairs
sector_company_pairs_grouped

tracker = 540
for sector, data in sector_company_pairs_grouped.items():
    data_list = data
    
    # Iterate over the data list for each sector
    for entry in data_list:
        symbol = entry[0]
        name = entry[1]
        
        # Replace invalid characters like "." in the symbol with "_"
        symbol = symbol.replace(".", "_")
        
        try:
            # Create a child node for each ticker with a value being a pair
            print(symbol + ', ' + name + ', ' + sector)
        
        except Exception as e:
            # Handle any exceptions that may occur during the set operation
            tracker = tracker-1
print(tracker)
