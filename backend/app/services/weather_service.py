import requests

def get_weather(lat, lng):
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current_weather=true"
        res = requests.get(url, timeout=5)

        if res.status_code != 200:
            return None

        data = res.json()["current_weather"]

        return {
            "temp": data.get("temperature", 30),
            "wind": data.get("windspeed", 10),
            "pressure": 1013,
            "humidity": 60,
            "rain": 0
        }

    except:
        return None