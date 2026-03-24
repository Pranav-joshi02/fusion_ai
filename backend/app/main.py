from fastapi import FastAPI
from app.api.routes import events

app = FastAPI(title="DisasterFusion AI")

app.include_router(events.router, prefix="/events", tags=["Events"])

@app.get("/")
def root():
    return {"message": "DisasterFusion API running"}