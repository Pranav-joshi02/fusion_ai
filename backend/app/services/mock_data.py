import random
import uuid
from datetime import datetime


# 🌦️ Mock Weather
def generate_mock_weather():
    return {
        "temp": random.uniform(25, 40),
        "humidity": random.uniform(40, 90),
        "wind": random.uniform(5, 40),
        "pressure": random.uniform(980, 1020),
        "rain": random.uniform(0, 150),
    }


# 🌫️ Mock AQI
def generate_mock_aqi():
    return random.uniform(50, 200)


# 🧠 Mock Prediction (NEW)
def generate_mock_prediction(lat, lng, location):
    types = ["flood", "wildfire", "cyclone", "pollution", "heatwave"]

    return {
        "id": str(uuid.uuid4()),
        "location": location,
        "latitude": lat,
        "longitude": lng,
        "prediction": random.choice(types),
        "confidence": round(random.uniform(60, 95), 1),
        "weather": {
            "temp": random.uniform(25, 40),
            "humidity": random.uniform(40, 90),
            "wind": random.uniform(5, 40),
        },
        "aqi": random.uniform(50, 200),
        "data_source": "mock",
        "timestamp": datetime.utcnow().isoformat(),
    }