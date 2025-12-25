from fastapi import FastAPI, Depends, HTTPException, status
from datetime import timedelta
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List

import models, schemas, auth, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS setup
# CORS setup
# For development, we'll be very permissive
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False, # We use Bearer token header, so we don't strictly need this to be True for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

from sqladmin import Admin
import admin

admin_app = Admin(app, database.engine, authentication_backend=admin.authentication_backend)
admin_app.add_view(admin.UserAdmin)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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
        
    # Check if token version matches
    if version and user.token_version and version != user.token_version:
        # Token is old/invalid
        raise credentials_exception
        
    return user

from sqlalchemy import or_

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        or_(
            models.User.email == form_data.username,
            models.User.username == form_data.username
        )
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    is_valid = auth.verify_password(form_data.password, user.hashed_password)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    # Include token_version in the token
    access_token = auth.create_access_token(
        data={"sub": user.email, "version": user.token_version or 1}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_username = db.query(models.User).filter(models.User.username == user.username).first()
    if db_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.put("/users/me", response_model=schemas.User)
def update_user(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if user_update.email and user_update.email != current_user.email:
        db_user = db.query(models.User).filter(models.User.email == user_update.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email
        
    if user_update.username and user_update.username != current_user.username:
        db_username = db.query(models.User).filter(models.User.username == user_update.username).first()
        if db_username:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = user_update.username
        
    if user_update.password:
        current_user.hashed_password = auth.get_password_hash(user_update.password)
        # Invalidate old tokens
        current_user.token_version = (current_user.token_version or 1) + 1

    if user_update.avatar is not None:
        if user_update.avatar == "":
            current_user.avatar = None
        else:
            current_user.avatar = user_update.avatar

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@app.get("/users/{user_id}/avatar")
async def get_user_avatar(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.avatar:
        # Return a placeholder or 404
        raise HTTPException(status_code=404, detail="Avatar not found")
    
    # Check if it is a data URI
    import base64
    from fastapi.responses import Response
    
    if user.avatar.startswith("data:"):
        header, encoded = user.avatar.split(",", 1)
        media_type = header.split(":")[1].split(";")[0]
        data = base64.b64decode(encoded)
        return Response(content=data, media_type=media_type)
    else:
        # Fallback if it's somehow just a path or raw (unlikely in current impl)
        raise HTTPException(status_code=500, detail="Invalid avatar format")

@app.get("/")
def read_root():
    return {"message": "Hello World"}
