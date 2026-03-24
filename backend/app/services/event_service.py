from sqlalchemy.orm import Session
from app.models.event import Event
import random

def calculate_confidence():
    return round(random.uniform(50, 95), 2)

def calculate_severity(confidence):
    if confidence > 80:
        return "high"
    elif confidence > 60:
        return "moderate"
    return "low"

def create_event(db: Session, data):
    confidence = calculate_confidence()
    severity = calculate_severity(confidence)

    event = Event(
        type=data.type,
        latitude=data.latitude,
        longitude=data.longitude,
        description=data.description,
        confidence=confidence,
        severity=severity
    )

    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def get_events(db: Session):
    return db.query(Event).order_by(Event.created_at.desc()).all()


def get_event_by_id(db: Session, event_id: int):
    return db.query(Event).filter(Event.id == event_id).first()