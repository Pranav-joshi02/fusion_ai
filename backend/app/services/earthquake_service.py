import requests

def get_earthquakes():
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=5"
    data = requests.get(url).json()["features"]

    events = []
    for eq in data:
        coords = eq["geometry"]["coordinates"]
        mag = eq["properties"]["mag"]

        events.append({
            "type": "earthquake",
            "category": "sudden",
            "source": "usgs",
            "latitude": coords[1],
            "longitude": coords[0],
            "severity": "critical" if mag > 6 else "moderate",
            "confidence": 95
        })
    return events