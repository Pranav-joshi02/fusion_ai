import requests

def get_fires():
    try:
        url = "https://firms.modaps.eosdis.nasa.gov/api/countries/VIIRS_SNPP_NRT/IND/1.json"
        res = requests.get(url)

        if res.status_code != 200:
            print("NASA API failed")
            return []

        data = res.json()

        return [
            {
                "type": "wildfire",
                "lat": f.get("latitude"),
                "lng": f.get("longitude"),
                "severity": "high",
                "confidence": 85
            }
            for f in data if "latitude" in f
        ]

    except Exception as e:
        print("NASA error:", e)
        return []