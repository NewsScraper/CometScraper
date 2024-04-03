import ArabicNames
import nltk 
from nltk.sentiment.vader import SentimentIntensityAnalyzer

vader = SentimentIntensityAnalyzer()

name = ArabicNames.get_full_name() 
sentiment_scores = vader.polarity_scores(name)
print(name)
print(sentiment_scores)