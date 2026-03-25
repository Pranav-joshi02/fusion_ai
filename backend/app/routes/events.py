from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.event import Event

router = APIRouter()

@router.get("/events")
def get_events(
    category: str = None,
    min_confidence: float = 0,
    db: Session = Depends(get_db)
):
    q = db.query(Event)

    if category:
        q = q.filter(Event.category == category)

    if min_confidence:
        q = q.filter(Event.confidence >= min_confidence)

    return q.all()