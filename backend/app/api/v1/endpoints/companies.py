from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .... import models, schemas
from ...deps import get_db, get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.Company)
def create_company(
    company_in: schemas.CompanyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only administrators can create companies"
        )

    # Create Company instance
    db_company = models.Company(
        name=company_in.name,
        type=company_in.type,
        bin_iin=company_in.bin_iin,
        kbe=company_in.kbe,
        vat_status=company_in.vat_status,
        phone=company_in.phone,
        email=company_in.email,
        website=company_in.website,
        logo=company_in.logo,
        stamp=company_in.stamp,
        owner_id=current_user.id
    )
    db.add(db_company)
    db.flush() # Get company ID

    # Link creator to this company
    current_user.company_id = db_company.id
    db.add(current_user)

    # Add Bank Accounts
    for ba in company_in.bank_accounts:
        db_ba = models.BankAccount(**ba.model_dump(), company_id=db_company.id)
        db.add(db_ba)

    # Add Addresses
    for addr in company_in.addresses:
        db_addr = models.Address(**addr.model_dump(), company_id=db_company.id)
        db.add(db_addr)

    # Add Responsible Persons
    for rp in company_in.responsible_persons:
        db_rp = models.ResponsiblePerson(**rp.model_dump(), company_id=db_company.id)
        db.add(db_rp)

    db.commit()
    db.refresh(db_company)
    db.refresh(current_user)
    return db_company

@router.get("/my", response_model=schemas.Company)
def get_my_company(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    print(f"MY COMPANY LOOKUP: UserID={current_user.id}, CompanyID={current_user.company_id}")
    if current_user.company:
        return current_user.company
    
    # Fallback if relationship is not loaded but ID exists
    if current_user.company_id:
        print(f"FALLBACK LOOKUP: CompanyID={current_user.company_id}")
        company = db.query(models.Company).filter(models.Company.id == current_user.company_id).first()
        if company:
            return company
            
    print("MY COMPANY LOOKUP FAILED: 404")
    raise HTTPException(status_code=404, detail="Company not found")

@router.put("/my", response_model=schemas.Company)
def update_company(
    company_in: schemas.CompanyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db_company = current_user.company
    
    # Update main info
    data = company_in.model_dump(exclude={'bank_accounts', 'addresses', 'responsible_persons'})
    for field, value in data.items():
        setattr(db_company, field, value)
    
    # Update Bank Accounts (Simplified: delete and recreate)
    db.query(models.BankAccount).filter(models.BankAccount.company_id == db_company.id).delete()
    for ba in company_in.bank_accounts:
        db_ba = models.BankAccount(**ba.model_dump(), company_id=db_company.id)
        db.add(db_ba)

    # Update Addresses
    db.query(models.Address).filter(models.Address.company_id == db_company.id).delete()
    for addr in company_in.addresses:
        db_addr = models.Address(**addr.model_dump(), company_id=db_company.id)
        db.add(db_addr)

    # Update Responsible Persons
    db.query(models.ResponsiblePerson).filter(models.ResponsiblePerson.company_id == db_company.id).delete()
    for rp in company_in.responsible_persons:
        db_rp = models.ResponsiblePerson(**rp.model_dump(), company_id=db_company.id)
        db.add(db_rp)

    db.commit()
    db.refresh(db_company)
    return db_company
