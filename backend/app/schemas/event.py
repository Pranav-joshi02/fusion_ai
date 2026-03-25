from pydantic import BaseModel

class EventOut(BaseModel):
    id: str
    lat: float
    lng: float
    severity: str
    confidence: float