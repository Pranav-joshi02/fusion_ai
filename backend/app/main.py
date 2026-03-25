from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.routes import events
from app.services.pipeline import run_pipeline
import threading
import time

Base.metadata.create_all(bind=engine)

app = FastAPI()

# ✅ CORS — allow frontend dev server and any deployed origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router)

def worker():
    while True:
        db = SessionLocal()
        try:
            run_pipeline(db)
        except Exception as e:
            print("Pipeline error:", e)
        finally:
            db.close()
        time.sleep(10)

@app.on_event("startup")
async def start_pipeline():
    import asyncio
    from app.db.session import SessionLocal

    async def loop():
        while True:
            db = SessionLocal()
            try:
                run_pipeline(db)
            except Exception as e:
                print("Pipeline error:", e)
            finally:
                db.close()

            await asyncio.sleep(10)

    asyncio.create_task(loop())

@app.get("/")
def root():
    return {"msg": "DisasterFusion Live Backend Running"}

# --- WebSocket connection pools ---
active_connections: list[WebSocket] = []           # → globe real-time events
active_prediction_connections: list[WebSocket] = [] # → analytics ML predictions

@app.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except Exception:
        pass
    finally:
        if websocket in active_connections:
            active_connections.remove(websocket)

@app.websocket("/ws/predictions")
async def websocket_predictions(websocket: WebSocket):
    await websocket.accept()
    active_prediction_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except Exception:
        pass
    finally:
        if websocket in active_prediction_connections:
            active_prediction_connections.remove(websocket)
