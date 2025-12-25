from app.database import SessionLocal, engine
from app import models
from app import auth

# Create tables
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

email = "admin@example.com"
password = "admin"

user = db.query(models.User).filter(models.User.email == email).first()
if not user:
    print(f"Creating admin user: {email} / {password}")
    hashed_password = auth.get_password_hash(password)
    user = models.User(email=email, username="admin_super", hashed_password=hashed_password, is_admin=True)
    db.add(user)
    db.commit()
    print("Admin user created successfully!")
else:
    print("Admin user already exists.")

db.close()
