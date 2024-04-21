from http.server import BaseHTTPRequestHandler
import json
import yfinance as yf
from bs4 import BeautifulSoup
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from datetime import datetime
import requests
import numpy as np

class SentimentHandler(BaseHTTPRequestHandler):
 
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        # Retrieve the stock ticker from the path
        stock_ticker = self.path.split('/')[-1]
        
        # Function to get sentiment scores from news articles
        def get_sentiment_scores(stock_ticker):
            try:
                stock = yf.Ticker(stock_ticker)
                news_articles = stock.news

                if 'longBusinessSummary' in stock.info:
                    long_business_summary = stock.info['longBusinessSummary']
                else:
                    long_business_summary = "No long business summary found."

                article_links = []
                article_texts = []
                article_titles = []
                article_dates = []

                for i, article in enumerate(news_articles):
                    if i >= 15:
                        break
                    try:
                        response = requests.get(article['link'])
                        soup = BeautifulSoup(response.text, 'html.parser')
                        article_body = soup.find('div', class_='caas-body')
                        if article_body:
                            article_title = article['title']
                            article_text = article_body.get_text()
                            article_texts.append((article_title, article_text))
                            article_links.append(article['link'])
                            provider_publish_time = datetime.utcfromtimestamp(article['providerPublishTime'])
                            current_time = datetime.utcnow()
                            time_difference = current_time - provider_publish_time
                            if time_difference.days == 0:
                                hours_ago = time_difference.seconds // 3600
                                if hours_ago == 0:
                                    minutes_ago = (time_difference.seconds % 3600) // 60
                                    if minutes_ago == 0:
                                        formatted_time = "Just now"
                                    elif minutes_ago == 1:
                                        formatted_time = "1 minute ago"
                                    else:
                                        formatted_time = f"{minutes_ago} minutes ago"
                                elif hours_ago == 1:
                                    formatted_time = "1 hour ago"
                                else:
                                    formatted_time = f"{hours_ago} hours ago"
                            elif time_difference.days == 1:
                                formatted_time = "1 day ago"
                            else:
                                formatted_time = f"{time_difference.days} days ago"
                            article_dates.append(formatted_time)
                    except Exception as e:
                        print(f"Error processing article: {str(e)}")

                vader = SentimentIntensityAnalyzer()
                data = []

                for i, (article_title, article_text) in enumerate(article_texts):
                    combined_text = article_title + ' ' + article_text
                    sentiment_scores = vader.polarity_scores(combined_text)
                    data.append(sentiment_scores)

                mean_neg = np.mean([score['neg'] for score in data])
                mean_neu = np.mean([score['neu'] for score in data])
                mean_pos = np.mean([score['pos'] for score in data])
                mean_compound = np.mean([score['compound'] for score in data])

                overall_sentiment = 'positive' if mean_compound >= 0.05 else 'negative' if mean_compound <= -0.05 else 'neutral'

                combined_triplets = [{'href': link, 'title': title, 'score': score, 'date': date} for link, title, score, date in zip(article_links, article_titles, data, article_dates)]

                return {
                    'Stock': stock_ticker,
                    'LongBusinessSummary': long_business_summary,
                    'Articles': combined_triplets,
                    'MeanNeg': mean_neg,
                    'MeanNeu': mean_neu,
                    'MeanPos': mean_pos,
                    'MeanCompound': mean_compound,
                    'OverallSentiment': overall_sentiment
                }

            except Exception as e:
                print(f"Error processing sentiment analysis: {str(e)}")
                return {}

        # Get sentiment scores for the specified stock ticker
        sentiment_data = get_sentiment_scores(stock_ticker)

        # Send the response as JSON
        self.wfile.write(json.dumps(sentiment_data).encode('utf-8'))
        return
