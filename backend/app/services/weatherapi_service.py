import requests
from app.config.settings import WEATHERAPI_KEY

def get_weatherapi(lat, lng):
    url = f"http://api.weatherapi.com/v1/current.json?key={WEATHERAPI_KEY}&q={lat},{lng}"
    res = requests.get(url).json()["current"]

    return {
        "temp": res["temp_c"],
        "humidity": res["humidity"],
        "wind": res["wind_kph"],
        "pressure": res["pressure_mb"],
        "rain": res.get("precip_mm", 0)
    }