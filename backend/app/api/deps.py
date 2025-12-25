from fastapi import Depends, HTTPException, status
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from .. import models, schemas, auth, database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/users/token")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        version: int = payload.get("version")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
        
    if version and user.token_version and version != user.token_version:
        raise credentials_exception
        
    return user
