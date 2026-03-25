def merge_weather(t1, t2):
    return {
        "temp": (t1["temp"] + t2["temp"]) / 2,
        "humidity": (t1["humidity"] + t2["humidity"]) / 2,
        "wind": (t1["wind"] + t2["wind"]) / 2,
        "pressure": (t1["pressure"] + t2["pressure"]) / 2,
        "rain": max(t1["rain"], t2["rain"])
    }

def detect(weather, aqi):
    events = []

    if weather["rain"] > 80:
        events.append(("flood", "sudden", "high"))

    if weather["wind"] > 25:
        events.append(("cyclone", "sudden", "critical"))

    if aqi > 150:
        events.append(("pollution", "chronic", "high"))

    if weather["temp"] > 40:
        events.append(("heatwave", "predicted", "moderate"))

    return events