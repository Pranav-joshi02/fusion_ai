from sqlalchemy import Column, String, Float, DateTime
from app.db.base import Base
import uuid
from datetime import datetime

class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(String)
    category = Column(String)  # sudden / chronic / predicted
    source = Column(String)

    latitude = Column(Float)
    longitude = Column(Float)

    severity = Column(String)
    confidence = Column(Float)

    status = Column(String, default="active")
    timestamp = Column(DateTime, default=datetime.utcnow)