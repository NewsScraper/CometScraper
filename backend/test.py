import yfinance as yf
import numpy as np
import pandas as pd
import nltk 
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from bs4 import BeautifulSoup
import requests


#nltk.download('vader_lexicon') # one time only
ticker = "amzn"
stock = yf.Ticker(ticker)


# show news
news_articles = stock.news

GetStockInfo = yf.Ticker(ticker)

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
            #print("-" * 50)
        else:
            print("Article body not found on the page.")

    except Exception as e:
        print(f"Error processing article: {str(e)}")

vader = SentimentIntensityAnalyzer() # or whatever you want to call it

for i, (article_title, article_text) in enumerate(article_texts):
    # Concatenate the title and text, treating the title as the first sentence
    combined_text = article_title + ' ' + article_text

    # Analyze the sentiment of the combined text
    sentiment_scores = vader.polarity_scores(combined_text)

    # Extract sentiment scores
    compound_score = sentiment_scores['compound']
    positive_score = sentiment_scores['pos']
    negative_score = sentiment_scores['neg']
    neutral_score = sentiment_scores['neu']

    # Print sentiment scores along with the article title
    #print(f"Article {i + 1} - {article_title}")
    #print(f"Combined Text: {combined_text}")
    #print(sentiment_scores)
    #print("-" * 100)

data = []

# Iterate through the list of article texts and titles
for i, (article_title, article_text) in enumerate(article_texts):
    # Concatenate the title and text, treating the title as the first sentence
    combined_text = article_title + ' ' + article_text

    # Analyze the sentiment of the combined text
    sentiment_scores = vader.polarity_scores(combined_text)

    # Extract sentiment scores
    compound_score = sentiment_scores['compound']
    positive_score = sentiment_scores['pos']
    negative_score = sentiment_scores['neg']
    neutral_score = sentiment_scores['neu']

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

# Print the results
# print(f"LBS': {long_business_summary}")
print(f"Mean 'neg': {mean_neg}")
print(f"Mean 'neu': {mean_neu}")
print(f"Mean 'pos': {mean_pos}")
print(f"Mean 'Compound Score': {average_compound_score}")
print(f"Overall Sentiment: {overall_score}")
print(f"Scraped Articles: {article_links}")
print(f"# of Articles: {articleCt}")
print(f"Current Value: {current_value}")
print(f"Change in Dollars: {change_in_dollars}")
print(f"Percent Change: {percent_change}%")
