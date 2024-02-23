# Import relevant libraries
import pandas as pd
from bs4 import BeautifulSoup
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf;
import numpy as np
import requests
from datetime import datetime

# Initialize the Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Define a route for fetching sentiment analysis based on a stock ticker
@app.route('/sentiment', methods=['GET'])
def get_sentiment():
    # Retrieve the stock ticker from the query parameters
    stock_ticker = request.args.get('ticker')
    
    stock = yf.Ticker(stock_ticker)
    # chartData = stock.history(period='1095d', interval='1d')
    chartData = stock.history(period='10950d', interval='1d')
    close_prices = chartData['Close']
    close_prices_list = close_prices.tolist()
    chartPointCt =  len(close_prices_list)


    # show news
    news_articles = stock.news

    GetStockInfo = yf.Ticker(stock_ticker)

    if 'longBusinessSummary' in GetStockInfo.info:
        long_business_summary = GetStockInfo.info['longBusinessSummary']
    else:
        print("No 'longBusinessSummary' found in the dictionary.")# get all key value pairs that are available


    historical_data = stock.history(period='2d', interval='1d')

    # Access the closing price from yesterday (second-to-last data point)
    yesterday_close = historical_data['Close'].iloc[-2]

    # Get the intraday data for the current day (as you've already done)
    intraday_data = stock.history(period='1d', interval='1m')

    # Access the most recent closing price (current value)
    current_value = intraday_data['Close'].iloc[-1]

    # Calculate the change in dollars
    change_in_dollars = current_value - yesterday_close

    # Calculate the percent change
    percent_change = (change_in_dollars / yesterday_close) * 100

    article_links = []
    article_texts = []
    article_titles = []
    article_publishers = []
    article_dates = []
    articleCt = 0

    for i, article in enumerate(news_articles):
        if i >= 15:
            break

        try:
            # Fetch the article content using requests and BeautifulSoup
            response = requests.get(article['link'])
            soup = BeautifulSoup(response.text, 'html.parser')

            # Find and print the article body text
            article_body = soup.find('div', class_='caas-body')
            if article_body:
                article_title = article['title']
                article_text = article_body.get_text()
                article_texts.append((article_title, article_text))
                articleCt = articleCt + 1
                article_links.append(article['link'])
                article_publishers.append(article['publisher'])
                providerpublishtime = datetime.utcfromtimestamp( article['providerPublishTime'])
                current_time = datetime.utcnow()
                time_difference = current_time - providerpublishtime

                # If the article was published on the same day, display the time in hours
                if time_difference.days == 0:
                    hours_ago = time_difference.seconds // 3600  # Convert seconds to hours
                    if hours_ago == 0:
                        # If less than an hour ago, calculate and display minutes
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
                    # If not the same day, display days
                    formatted_time = f"{time_difference.days} days ago"

                article_dates.append(formatted_time)
                #print("-" * 50)
            else:
                print("Article body not found on the page.")

        except Exception as e:
            print(f"Error processing article: {str(e)}")

    vader = SentimentIntensityAnalyzer() # or whatever you want to call it

    data = []
    scores_list = []

    # Iterate through the list of article texts and titles
    for i, (article_title, article_text) in enumerate(article_texts):
        # Concatenate the title and text, treating the title as the first sentence
        combined_text = article_title + ' ' + article_text
        article_titles.append(article_title)
        # Analyze the sentiment of the combined text
        sentiment_scores = vader.polarity_scores(combined_text)

        # Extract sentiment scores
        compound_score = sentiment_scores['compound']
        positive_score = sentiment_scores['pos']
        negative_score = sentiment_scores['neg']
        neutral_score = sentiment_scores['neu']
        scores = [
            ('positive_score', positive_score),
            ('negative_score', negative_score),
            ('neutral_score', neutral_score),
            ('compound_score', compound_score)
        ]
        scores_list.append(scores)

        # Determine sentiment based on the compound score
        if compound_score >= 0.05:
            sentiment = 'pos'
        elif compound_score <= -0.05:
            sentiment = 'neg'
        else:
            sentiment = 'neu'

        # Append data to the list
        data.append([article_title, sentiment_scores, compound_score, sentiment])

    # Create a DataFrame from the data list
    df = pd.DataFrame(data, columns=['Article Title', 'Sentiment Scores', 'Compound Score', 'Sentiment'])

    # Calculate the mean values for 'neg', 'neu', and 'pos'
    mean_neg = df['Sentiment Scores'].apply(lambda x: x['neg']).mean()
    mean_neu = df['Sentiment Scores'].apply(lambda x: x['neu']).mean()
    mean_pos = df['Sentiment Scores'].apply(lambda x: x['pos']).mean()
    
    # Calculate the mean 'Compound Score'
    average_compound_score = df['Compound Score'].mean()

    # Derive the overall sentiment score based on average polarity
    if average_compound_score >= 0.05:
        overall_score = 'positive'
    elif average_compound_score <= -0.05:
        overall_score = 'negative'
    else:
        overall_score = 'neutral'

    combined_triplets = [{'href': link, 'title': title, 'score': score, 'info': info, 'date' : date} for link, title, score, info, date in zip(article_links, article_titles, scores_list, article_publishers, article_dates)]

    return jsonify({
        'Stock' : stock_ticker,
        'Value' : current_value,
        'Count' : articleCt,
        'Articles' : combined_triplets,
        'yClose' : yesterday_close,
        'dChange' : change_in_dollars,
        'pChange' : percent_change,
        'LBS' : long_business_summary,
        'Neg': mean_neg,
        'Neu': mean_neu,
        'Pos': mean_pos,
        'Compound Score': average_compound_score,
        'Overall Sentiment': overall_score,
        'Close Prices': close_prices_list,
        'ChartPointCt' : chartPointCt,
    })


# Running app
if __name__ == '__main__':
    app.run(debug=True, port=5000)