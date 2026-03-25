import joblib
import numpy as np

model = joblib.load("ml/disaster_model.pkl")

def predict_ml(weather, aqi):
    features = np.array([[
        weather["temp"],
        weather["humidity"],
        weather["wind"],
        weather["pressure"],
        weather["rain"],
        aqi
    ]])

    prediction = model.predict(features)[0]
    probs = model.predict_proba(features)[0]

    confidence = max(probs)

    return prediction, confidence