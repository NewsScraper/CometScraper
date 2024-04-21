from http.server import BaseHTTPRequestHandler
import json
import yfinance as yf

class StockInfoHandler(BaseHTTPRequestHandler):
 
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        # Retrieve the stock ticker from the path
        stock_ticker = self.path.split('/')[-1]

        # Fetch stock information
        stock = yf.Ticker(stock_ticker)
        intraday_data = stock.history(period='1d', interval='1m')
        current_value = intraday_data['Close'].iloc[-1]
        historical_data = stock.history(period='2d', interval='1d')
        yesterday_close = historical_data['Close'].iloc[-2]
        change_in_dollars = current_value - yesterday_close
        percent_change = (change_in_dollars / yesterday_close) * 100

        response = {
            'Stock': stock_ticker,
            'Value': current_value,
            'dChange': change_in_dollars,
            'pChange': percent_change
        }

        self.wfile.write(json.dumps(response).encode('utf-8'))
        return
