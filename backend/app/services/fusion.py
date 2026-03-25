from app.models.event import Event

def find_similar_event(lat, lng, db):
    events = db.query(Event).all()

    for e in events:
        if abs(e.latitude - lat) < 0.5 and abs(e.longitude - lng) < 0.5:
            return e

    return None