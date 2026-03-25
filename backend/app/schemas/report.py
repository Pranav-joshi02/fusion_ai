from pydantic import BaseModel

class ReportCreate(BaseModel):
    text: str
    lat: float
    lng: float