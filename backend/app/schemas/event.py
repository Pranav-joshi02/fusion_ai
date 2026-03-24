from pydantic import BaseModel
from datetime import datetime

class EventCreate(BaseModel):
    type: str
    latitude: float
    longitude: float
    description: str

class EventResponse(BaseModel):
    id: int
    type: str
    latitude: float
    longitude: float
    confidence: float
    severity: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True