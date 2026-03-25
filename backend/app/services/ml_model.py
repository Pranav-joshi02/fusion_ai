import numpy as np
import os

# 📁 Safe path handling
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "../ml/disaster_model.pkl")
LABEL_PATH = os.path.join(BASE_DIR, "../ml/label_mapping.pkl")

# 🔄 LOAD MODEL
try:
    import joblib

    _model = joblib.load(MODEL_PATH)
    _labels = joblib.load(LABEL_PATH)

    MODEL_LOADED = True
    print("✅ ML model + labels loaded successfully")

except Exception as e:
    _model = None
    _labels = None
    MODEL_LOADED = False
    print(f"⚠️ ML model not found ({e}), using rule-based fallback.")


# 🧠 RULE-BASED FALLBACK
def _rule_based(weather: dict, aqi: float):
    temp      = weather.get("temp", 25)
    humidity  = weather.get("humidity", 60)
    rain      = weather.get("rain", 0)
    wind      = weather.get("wind", 10)
    pressure  = weather.get("pressure", 1013)
    aqi_val   = float(aqi or 50)

    scores = {}

    if rain > 50 and humidity > 80:
        scores["flood"] = min(0.55 + rain / 200, 0.95)

    if temp > 38 and humidity < 30 and wind > 15:
        scores["wildfire"] = 0.80

    if aqi_val > 300:
        scores["pollution"] = 0.93
    elif aqi_val > 150:
        scores["pollution"] = 0.72

    if temp > 40:
        scores["heatwave"] = min(0.60 + (temp - 40) * 0.04, 0.92)

    if wind > 60:
        scores["storm"] = 0.88
    elif wind > 35:
        scores["storm"] = 0.65

    if rain < 2 and humidity < 25 and temp > 35:
        scores["drought"] = 0.68

    if pressure < 980:
        scores["cyclone"] = 0.70

    if not scores:
        return "none", 0.91

    label = max(scores, key=scores.get)
    return label, round(scores[label], 3)


# 🤖 ML PREDICTION
def predict_ml(weather: dict, aqi: float):
    """
    Predict disaster type from weather + AQI
    Returns: (label, confidence)
    """

    if not MODEL_LOADED or _model is None:
        return _rule_based(weather, aqi)

    try:
        # ✅ Normalize input
        temp = float(weather.get("temp", 25))
        humidity = float(weather.get("humidity", 60))
        wind = float(weather.get("wind", 10))
        pressure = float(weather.get("pressure", 1013))
        rain = float(weather.get("rain", 0))
        aqi_val = float(aqi or 50)

        features = np.array([[temp, humidity, wind, pressure, rain, aqi_val]])

        # 🔮 Prediction
        pred_encoded = _model.predict(features)[0]
        probs = _model.predict_proba(features)[0]
        confidence = float(max(probs))

        # 🔁 Decode label
        label = _labels.get(pred_encoded, "unknown")

        # ⚠️ Confidence filter
        if confidence < 0.5:
            return "uncertain", round(confidence, 3)

        return label, round(confidence, 3)

    except Exception as e:
        print("⚠️ ML error → fallback:", e)
        return _rule_based(weather, aqi)