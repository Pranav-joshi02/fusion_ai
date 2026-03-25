import requests

def get_fires():
    url = "https://firms.modaps.eosdis.nasa.gov/api/countries/VIIRS_SNPP_NRT/IND/1.json"
    data = requests.get(url).json()

    return [
        {
            "type": "wildfire",
            "category": "sudden",
            "source": "nasa",
            "latitude": f["latitude"],
            "longitude": f["longitude"],
            "severity": "high",
            "confidence": 85
        }
        for f in data
    ]