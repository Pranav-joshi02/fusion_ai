from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.models.event import Event

router = APIRouter()


def _serialize(e: Event) -> dict:
    return {
        "id":         e.id,
        "type":       e.type,
        "category":   e.category,
        "source":     e.source,
        "latitude":   e.latitude,
        "longitude":  e.longitude,
        "severity":   e.severity,
        "confidence": e.confidence,
        "status":     e.status,
        "timestamp":  e.timestamp.isoformat() if e.timestamp else None,
    }


@router.get("/events")
def get_events(
    category:       Optional[str]   = None,
    severity:       Optional[str]   = None,
    min_confidence: float            = 0,
    limit:          int              = 200,
    db: Session = Depends(get_db),
):
    q = db.query(Event)
    if category:
        q = q.filter(Event.category == category)
    if severity:
        q = q.filter(Event.severity == severity)
    if min_confidence:
        q = q.filter(Event.confidence >= min_confidence)
    return [_serialize(e) for e in q.order_by(Event.timestamp.desc()).limit(limit)]


@router.get("/events/stats")
def get_stats(db: Session = Depends(get_db)):
    """Quick aggregated stats for the dashboard bottom strip."""
    total    = db.query(Event).count()
    active   = db.query(Event).filter(Event.status == "active").count()
    critical = db.query(Event).filter(Event.severity == "critical").count()
    high     = db.query(Event).filter(Event.severity == "high").count()
    return {
        "total":    total,
        "active":   active,
        "critical": critical,
        "high":     high,
    }
