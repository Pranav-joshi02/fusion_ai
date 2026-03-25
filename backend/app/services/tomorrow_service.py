import time
import requests
from app.config.settings import TOMORROW_API_KEY

# 🧠 CACHE STORE
cache = {}
CACHE_TTL = 300  # 5 minutes


def get_tomorrow_weather(lat, lng):
    key = f"{lat},{lng}"
    now = time.time()

    # ✅ USE CACHE
    if key in cache:
        if now - cache[key]["time"] < CACHE_TTL:
            return cache[key]["data"]

    try:
        url = f"https://api.tomorrow.io/v4/weather/realtime?location={lat},{lng}&apikey={TOMORROW_API_KEY}"
        res = requests.get(url)

        if res.status_code != 200:
            print("⚠️ API limit or error:", res.status_code)
            return cache.get(key, {}).get("data")

        data = res.json()

        if "data" not in data or "values" not in data["data"]:
            return cache.get(key, {}).get("data")

        values = data["data"]["values"]

        result = {
            "temp": values.get("temperature", 25),
            "humidity": values.get("humidity", 60),
            "wind": values.get("windSpeed", 10),
            "pressure": values.get("pressureSurfaceLevel", 1013),
            "rain": values.get("rainIntensity", 0)
        }

        # 💾 SAVE CACHE
        cache[key] = {
            "data": result,
            "time": now
        }

        return result

    except Exception as e:
        print("Error:", e)
        return cache.get(key, {}).get("data")