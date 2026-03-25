import asyncio
import time
from datetime import datetime, timedelta
import uuid
from app.services.weather_service import get_weather
from app.services.waqi_service import get_aqi
from app.services.earthquake_service import get_earthquakes
from app.services.gdacs_service import get_gdacs
from app.services.ml_model import predict_ml
from app.services.mock_data import generate_mock_weather, generate_mock_aqi
from app.services.fusion_engine import detect
from app.services.mock_data import generate_mock_prediction
from app.models.event import Event


# ── Location names ─────────────────────────────────────────────
LOCATION_MAP = {
    (19.07, 72.87):   "Mumbai, India",
    (28.61, 77.20):   "Delhi, India",
    (34.05, -118.24): "Los Angeles, USA",
}

def _location_name(lat, lng):
    for (la, lo), name in LOCATION_MAP.items():
        if abs(la - lat) < 1.5 and abs(lo - lng) < 1.5:
            return name
    return f"{lat:.2f},{lng:.2f}"


# ── WebSocket pools ────────────────────────────────────────────
try:
    from app.main import active_connections, active_prediction_connections
except:
    active_connections = []
    active_prediction_connections = []


# ── Helpers ────────────────────────────────────────────────────
def is_duplicate(db, lat, lng, event_type):
    recent_time = datetime.utcnow() - timedelta(minutes=10)

    return db.query(Event).filter(
        Event.type == event_type,
        Event.latitude.between(lat - 0.5, lat + 0.5),
        Event.longitude.between(lng - 0.5, lng + 0.5),
        Event.timestamp >= recent_time
    ).first()


def calculate_confidence(base, sources=1):
    return min(base + sources * 5, 100)


async def _broadcast(pool, payload):
    for conn in list(pool):
        try:
            await conn.send_json(payload)
        except:
            pass
def run_pipeline(db):

    events_payload = []
    predictions_payload = []

    locations = [
        (19.07, 72.87),
        (28.61, 77.20),
        (34.05, -118.24),
    ]

    for lat, lng in locations:
        loc = _location_name(lat, lng)

        # your existing logic...

        # 🧪 ADD MOCK HERE (INSIDE LOOP)
        mock_pred = generate_mock_prediction(lat, lng, loc)
        predictions_payload.append(mock_pred)

def _event_dict(event, location):
    return {
        "id": str(event.id),
        "type": event.type,
        "category": event.category,
        "source": event.source,
        "latitude": event.latitude,
        "longitude": event.longitude,
        "severity": event.severity,
        "confidence": event.confidence,
        "location": location,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ── MAIN PIPELINE ──────────────────────────────────────────────
def run_pipeline(db):

    events_payload = []
    predictions_payload = []

    locations = [
        (19.07, 72.87),
        (28.61, 77.20),
        (34.05, -118.24),
    ]

    # ── WEATHER + ML ───────────────────────────────────────────
    for lat, lng in locations:
        loc = _location_name(lat, lng)

        try:
            # 🌦️ WEATHER (STABLE API)
            weather = get_weather(lat, lng)

            if weather:
                source_type = "real"
            else:
                print(f"⚠️ Using MOCK weather for {loc}")
                weather = generate_mock_weather()
                source_type = "mock"

            # 🌫️ AQI
            try:
                aqi = get_aqi(lat, lng)
                if not aqi:
                    raise Exception("Empty AQI")
            except:
                print(f"⚠️ Using MOCK AQI for {loc}")
                aqi = generate_mock_aqi()

            # 🔥 RULE-BASED DETECTION
            for event_type, category, severity in detect(weather, aqi):
                if is_duplicate(db, lat, lng, event_type):
                    continue

                confidence = calculate_confidence(70, 2)

                ev = Event(
                    type=event_type,
                    category=category,
                    source="fusion",
                    latitude=lat,
                    longitude=lng,
                    severity=severity,
                    confidence=confidence,
                    status="active",
                    timestamp=datetime.utcnow(),
                )

                db.add(ev)
                events_payload.append(_event_dict(ev, loc))

            # 🤖 ML PREDICTION
            ml_label, ml_conf = predict_ml(weather, aqi)

            predictions_payload.append({
    "id": str(uuid.uuid4()),  # ✅ CRITICAL FIX
    "location": loc,
    "latitude": lat,
    "longitude": lng,
    "prediction": ml_label,
    "confidence": round(ml_conf * 100, 1),
    "weather": weather,
    "aqi": aqi,
    "data_source": source_type,
    "timestamp": datetime.utcnow().isoformat(),
})

            # 🧠 Convert ML → Event
            if ml_label not in ["none", "uncertain"] and ml_conf > 0.5:
                ev = Event(
                    type=ml_label,
                    category="predicted",
                    source="ml",
                    latitude=lat,
                    longitude=lng,
                    severity="high" if ml_conf > 0.7 else "moderate",
                    confidence=int(ml_conf * 100),
                    status="active",
                    timestamp=datetime.utcnow(),
                )

                db.add(ev)
                events_payload.append(_event_dict(ev, loc))

            # ⏱️ Prevent rate limit
            time.sleep(1)

        except Exception as e:
            print(f"❌ Pipeline error [{lat},{lng}]:", e)

    # ── EARTHQUAKES ────────────────────────────────────────────
    try:
        for eq in get_earthquakes():
            lat = eq.get("lat") or eq.get("latitude")
            lng = eq.get("lng") or eq.get("longitude")

            if lat is None or lng is None:
                continue

            if is_duplicate(db, lat, lng, eq["type"]):
                continue

            ev = Event(
                type=eq["type"],
                category="sudden",
                source="usgs",
                latitude=lat,
                longitude=lng,
                severity=eq["severity"],
                confidence=eq["confidence"],
                status="active",
                timestamp=datetime.utcnow(),
            )

            db.add(ev)
            events_payload.append(_event_dict(ev, _location_name(lat, lng)))

    except Exception as e:
        print("Earthquake error:", e)

    # ── GDACS GLOBAL ALERTS ────────────────────────────────────
    try:
        for g in get_gdacs():
            lat = g.get("latitude")
            lng = g.get("longitude")

            if lat is None or lng is None:
                continue

            ev = Event(
                type=g["type"],
                category="sudden",
                source="gdacs",
                latitude=lat,
                longitude=lng,
                severity=g["severity"],
                confidence=g["confidence"],
                status="active",
                timestamp=datetime.utcnow(),
            )

            db.add(ev)
            events_payload.append(_event_dict(ev, _location_name(lat, lng)))

    except Exception as e:
        print("GDACS error:", e)

    # ── SAVE + BROADCAST ───────────────────────────────────────
    db.commit()

    if events_payload:
        asyncio.run(_broadcast(active_connections, events_payload))

    # 🔥 TEMP FIX: send predictions through EVENTS socket
    asyncio.run(_broadcast(active_connections, predictions_payload))

    print(
        f"[pipeline] {datetime.utcnow().strftime('%H:%M:%S')} — "
        f"{len(events_payload)} events, {len(predictions_payload)} predictions"
    )