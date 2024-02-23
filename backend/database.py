import yfinance as yf
import plotly.graph_objects as go

ticker = 'TSLA'
data = yf.download(tickers=ticker, period='60d', interval='1d')

fig = go.Figure(data=[go.Candlestick(x=data.index,
                                     open=data['Open'],
                                     high=data['High'],
                                     low=data['Low'],
                                     close=data['Close'])])

fig.show()