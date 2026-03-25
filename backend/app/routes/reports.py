from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.report import Report
from app.models.event import Event
from app.schemas.report import ReportCreate
from app.services.trust import calculate_trust
from app.services.fusion import find_similar_event

router = APIRouter()

@router.post("/events/report")
def report_event(data: ReportCreate, db: Session = Depends(get_db)):

    report = Report(
        text=data.text,
        lat=data.lat,
        lng=data.lng,
        status="pending"
    )

    db.add(report)
    db.commit()

    existing = find_similar_event(data.lat, data.lng, db)
    trust = calculate_trust(1, 70)

    if existing:
        existing.confidence = (existing.confidence + trust) / 2
    else:
        new_event = Event(
            type="unknown",
            latitude=data.lat,
            longitude=data.lng,
            severity="moderate",
            confidence=trust
        )
        db.add(new_event)

    db.commit()

    return {"message": "Report processed"}