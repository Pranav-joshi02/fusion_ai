import asyncio
from datetime import datetime, timedelta

from app.services.tomorrow_service import get_tomorrow_weather
from app.services.weatherapi_service import get_weatherapi
from app.services.waqi_service import get_aqi
from app.services.earthquake_service import get_earthquakes
from app.services.nasa_service import get_fires
from app.services.gdacs_service import get_gdacs
from app.services.fusion_engine import merge_weather, detect

from app.models.event import Event


# ⚡ OPTIONAL: import websocket connections
try:
    from app.main import active_connections
except:
    active_connections = []


# 🧠 DEDUP CHECK
def is_duplicate(db, lat, lng, event_type):
    recent_time = datetime.utcnow() - timedelta(minutes=10)

    existing = db.query(Event).filter(
        Event.type == event_type,
        Event.latitude.between(lat - 0.5, lat + 0.5),
        Event.longitude.between(lng - 0.5, lng + 0.5),
        Event.timestamp >= recent_time
    ).first()

    return existing


# ⭐ CONFIDENCE CALCULATION
def calculate_confidence(base, sources=1):
    return min(base + sources * 5, 100)


# 📡 WEBSOCKET BROADCAST
async def broadcast(events):
    for conn in active_connections:
        try:
            await conn.send_json(events)
        except:
            pass


# 🔄 MAIN PIPELINE
def run_pipeline(db):

    events_payload = []

    locations = [
        (19.07, 72.87),   # Mumbai
        (28.61, 77.20),   # Delhi
        (34.05, -118.24), # LA
    ]

    # 🌦️ WEATHER + AQI BASED DETECTION
    for lat, lng in locations:
        try:
            t1 = get_tomorrow_weather(lat, lng)
            t2 = get_weatherapi(lat, lng)

            weather = merge_weather(t1, t2)
            aqi = get_aqi(lat, lng)

            detected = detect(weather, aqi)

            for d in detected:
                event_type, category, severity = d

                if is_duplicate(db, lat, lng, event_type):
                    continue

                confidence = calculate_confidence(70, 2)

                event = Event(
                    type=event_type,
                    category=category,
                    source="fusion",
                    latitude=lat,
                    longitude=lng,
                    severity=severity,
                    confidence=confidence,
                    status="active",
                    timestamp=datetime.utcnow()
                )

                db.add(event)

                events_payload.append({
                    "id": str(event.id),
                    "type": event.type,
                    "category": event.category,
                    "latitude": event.latitude,
                    "longitude": event.longitude,
                    "severity": event.severity,
                    "confidence": event.confidence
                })

        except Exception as e:
            print("Weather pipeline error:", e)

    # 🌍 EARTHQUAKES (USGS)
    try:
        for eq in get_earthquakes():
            if is_duplicate(db, eq["lat"], eq["lng"], eq["type"]):
                continue

            event = Event(
                type=eq["type"],
                category="sudden",
                source="usgs",
                latitude=eq["lat"],
                longitude=eq["lng"],
                severity=eq["severity"],
                confidence=eq["confidence"],
                status="active",
                timestamp=datetime.utcnow()
            )

            db.add(event)

            events_payload.append({
                "id": str(event.id),
                "type": event.type,
                "category": event.category,
                "latitude": event.latitude,
                "longitude": event.longitude,
                "severity": event.severity,
                "confidence": event.confidence
            })

    except Exception as e:
        print("Earthquake error:", e)

    # 🔥 WILDFIRES (NASA)
    try:
        for f in get_fires():
            if is_duplicate(db, f["lat"], f["lng"], f["type"]):
                continue

            event = Event(
                type=f["type"],
                category="sudden",
                source="nasa",
                latitude=f["lat"],
                longitude=f["lng"],
                severity=f["severity"],
                confidence=f["confidence"],
                status="active",
                timestamp=datetime.utcnow()
            )

            db.add(event)

            events_payload.append({
                "id": str(event.id),
                "type": event.type,
                "category": event.category,
                "latitude": event.latitude,
                "longitude": event.longitude,
                "severity": event.severity,
                "confidence": event.confidence
            })

    except Exception as e:
        print("NASA error:", e)

    # 🌍 GDACS ALERTS
    try:
        for g in get_gdacs():
            if is_duplicate(db, g["latitude"], g["longitude"], g["type"]):
                continue

            event = Event(
                type=g["type"],
                category="sudden",
                source="gdacs",
                latitude=g["latitude"],
                longitude=g["longitude"],
                severity=g["severity"],
                confidence=g["confidence"],
                status="active",
                timestamp=datetime.utcnow()
            )

            db.add(event)

            events_payload.append({
                "id": str(event.id),
                "type": event.type,
                "category": event.category,
                "latitude": event.latitude,
                "longitude": event.longitude,
                "severity": event.severity,
                "confidence": event.confidence
            })

    except Exception as e:
        print("GDACS error:", e)

    # 💾 SAVE
    db.commit()

    # ⚡ REAL-TIME PUSH
    if events_payload:
        asyncio.run(broadcast(events_payload))