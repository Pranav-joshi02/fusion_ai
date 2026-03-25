import requests
from app.config.settings import TOMORROW_API_KEY

def get_tomorrow_weather(lat, lng):
    url = f"https://api.tomorrow.io/v4/weather/realtime?location={lat},{lng}&apikey={TOMORROW_API_KEY}"
    res = requests.get(url).json()["data"]["values"]

    return {
        "temp": res["temperature"],
        "humidity": res["humidity"],
        "wind": res["windSpeed"],
        "pressure": res["pressureSurfaceLevel"],
        "rain": res.get("rainIntensity", 0)
    }