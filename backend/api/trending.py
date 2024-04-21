from http.server import BaseHTTPRequestHandler
import json
import requests
import lxml.html

class TrendingHandler(BaseHTTPRequestHandler):
 
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        url = 'https://finance.yahoo.com/gainers'

        trendingArray = []
        ytext = requests.get(url).text
        yroot = lxml.html.fromstring(ytext)
        for x in yroot.xpath('//*[@id="fin-scr-res-table"]//a'):
            trendingArray.append(x.attrib['href'].split("/")[-1].split("?")[0])

        url2 = 'https://finance.yahoo.com/losers'

        losingArray = []
        ytext = requests.get(url2).text
        yroot = lxml.html.fromstring(ytext)
        for x in yroot.xpath('//*[@id="fin-scr-res-table"]//a'):
            losingArray.append(x.attrib['href'].split("/")[-1].split("?")[0])

        response = {
            'Trending': trendingArray,
            'Losing': losingArray
        }

        self.wfile.write(json.dumps(response).encode('utf-8'))
        return
