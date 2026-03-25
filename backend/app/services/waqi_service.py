import requests
from app.config.settings import WAQI_KEY

def get_aqi(lat, lng):
    url = f"https://api.waqi.info/feed/geo:{lat};{lng}/?token={WAQI_KEY}"
    return requests.get(url).json()["data"]["aqi"]