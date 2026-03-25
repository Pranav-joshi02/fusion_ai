from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"])

@router.post("/auth/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    hashed = pwd_context.hash(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed
    )

    db.add(new_user)
    db.commit()

    return {"message": "User created"}