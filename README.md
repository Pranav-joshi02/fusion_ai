# 🌍 Sankat.ai

### Real-Time Global Disaster Monitoring & Prediction Platform

DisasterFusion AI is a **real-time, AI-powered disaster intelligence platform** that visualizes global events on an interactive 3D globe and provides **live predictions using machine learning + multi-source data fusion**.

---

## 🚀 Features

### 🌐 Interactive Globe UI

* 3D rotating Earth visualization
* Hover-based event insights (location, severity, confidence)
* Layer toggles:

  * Sudden disasters (earthquakes, floods, etc.)
  * Chronic risks (AQI, droughts)
  * AI Predictions
  * Heatmap overlay

---

### ⚡ Real-Time Data Streaming

* WebSocket-based live updates
* Continuous event ingestion
* Auto-refreshing UI (no manual reload)

---

### 🧠 AI Prediction Engine

* Predicts disasters using:

  * Temperature
  * Humidity
  * Wind speed
  * Pressure
  * Rainfall
  * AQI
* Outputs:

  * Disaster type
  * Confidence score
  * Risk level

---

### 🔗 Multi-Source Data Fusion

Integrates data from:

* Open-Meteo (weather)
* WAQI (air quality)
* USGS (earthquakes)
* GDACS (global alerts)
* Mock fallback system (for reliability)

---

### 🛡️ Fault-Tolerant Architecture

* API fallback → mock data
* Works even without internet
* Ensures **zero downtime UI**

---

## 🏗️ Tech Stack

### 🖥️ Frontend

* React + TypeScript
* Tailwind CSS
* SVG-based 3D Globe Rendering
* WebSockets for real-time updates

### ⚙️ Backend

* FastAPI
* SQLAlchemy (DB)
* WebSocket server
* Async pipeline system

### 🤖 Machine Learning

* Scikit-learn (Random Forest / Classification)
* Custom dataset (weather → disaster mapping)
* Rule-based fallback system

---

## 📁 Project Structure

```bash
backend/
│
├── app/
│   ├── main.py                # FastAPI entry point + WebSockets
│   ├── services/
│   │   ├── pipeline.py        # Core data pipeline
│   │   ├── ml_model.py        # ML prediction logic
│   │   ├── weather_service.py # Open-Meteo API
│   │   ├── waqi_service.py    # AQI API
│   │   ├── earthquake_service.py
│   │   ├── gdacs_service.py
│   │   ├── mock_data.py       # fallback generator
│   │   └── fusion_engine.py
│   ├── models/
│   │   └── event.py
│   └── routes/
│       └── events.py
│
frontend/
│
├── components/
│   ├── InteractiveGlobe.tsx   # 3D globe visualization
│   ├── AnalysisPanel.tsx      # ML predictions UI
│
├── hooks/
│   ├── useDisasterEvents.ts
│   ├── useMlPredictions.ts
│
└── pages/
    └── AnalyticsPage.tsx
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/disasterfusion-ai.git
cd disasterfusion-ai
```

---

### 2️⃣ Backend Setup

```bash
cd backend

pip install -r requirements.txt
pip install "uvicorn[standard]" websockets

uvicorn app.main:app --reload
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

---

## 🔌 WebSocket Endpoints

| Endpoint          | Purpose                   |
| ----------------- | ------------------------- |
| `/ws/events`      | Real-time disaster events |
| `/ws/predictions` | AI predictions stream     |

---

## 🔄 Data Flow

```text
APIs → Data Fusion → ML Model → WebSocket → Frontend Globe + Analysis
```

---

## 🧠 AI Pipeline

1. Fetch weather + AQI
2. Normalize data
3. Run ML model
4. Generate prediction
5. Broadcast to frontend

---

## 🧪 Mock Mode (Demo Mode)

If APIs fail:

* System generates synthetic data every few seconds
* Ensures continuous UI updates
* Perfect for demos & offline use

---

## 📊 Example Prediction Output

```json
{
  "prediction": "flood",
  "confidence": 82.4,
  "location": "Mumbai, India",
  "data_source": "mock"
}
```

---

## 🎯 Use Cases

* Disaster monitoring dashboards
* Emergency response systems
* Climate analytics platforms
* Smart city risk assessment
* Research & visualization tools

---

## 🔥 Future Improvements

* Time-series forecasting (next 24–72 hrs)
* Satellite image integration
* AI anomaly detection
* Mobile app support
* Alert notification system

---

## 👨‍💻 Author

**Pranav Joshi-Team Cactus**
AI + Systems Engineering Enthusiast

---

## ⭐ Contribute

Feel free to:

* Fork the repo
* Submit pull requests
* Suggest improvements

---

## 📜 License

MIT License

---

## 🚀 Final Note

This project demonstrates:

> **Real-time systems + AI + visualization + resilience engineering**

Built to simulate a **production-grade disaster intelligence platform**.

---
