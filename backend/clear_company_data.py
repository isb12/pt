from app.database import SessionLocal
from app import models

def clear_data():
    db = SessionLocal()
    try:
        # Delete related data first due to FK constraints
        db.query(models.BankAccount).delete()
        db.query(models.Address).delete()
        db.query(models.ResponsiblePerson).delete()
        db.query(models.Company).delete()
        db.commit()
        print("Successfully cleared all company data.")
    except Exception as e:
        db.rollback()
        print(f"Error clearing data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_data()
