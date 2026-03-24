from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.event import EventCreate, EventResponse
from app.services import event_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=EventResponse)
def create_event(data: EventCreate, db: Session = Depends(get_db)):
    return event_service.create_event(db, data)


@router.get("/", response_model=list[EventResponse])
def get_all_events(db: Session = Depends(get_db)):
    return event_service.get_events(db)


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = event_service.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event