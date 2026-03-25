from fastapi import FastAPI
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.routes import events
from app.services.pipeline import run_pipeline
import threading
import time
from fastapi import WebSocket
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(events.router)

def worker():
    while True:
        db = SessionLocal()
        run_pipeline(db)
        db.close()
        time.sleep(300)

threading.Thread(target=worker, daemon=True).start()

@app.get("/")
def root():
    return {"msg": "DisasterFusion Live Backend Running"}

active_connections = []

@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)

    try:
        while True:
            await websocket.receive_text()
    except:
        active_connections.remove(websocket)