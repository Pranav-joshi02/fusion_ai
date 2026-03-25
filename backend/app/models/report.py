from sqlalchemy import Column, String, Float
from app.db.base import Base
import uuid

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    text = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    status = Column(String)