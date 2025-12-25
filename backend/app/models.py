from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Date, Text, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
    avatar = Column(String, nullable=True)
    token_version = Column(Integer, default=1)
    
    # Relationship to Company
    company = relationship("Company", back_populates="owner", uselist=False)

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String) # ИП or ТОО
    bin_iin = Column(String, index=True)
    kbe = Column(String)
    vat_status = Column(Boolean, default=False) # С НДС или без
    logo = Column(Text, nullable=True) # Base64
    stamp = Column(Text, nullable=True) # Base64
    
    # Contacts
    phone = Column(String)
    email = Column(String)
    website = Column(String, nullable=True)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="company")
    
    # Related collections
    bank_accounts = relationship("BankAccount", back_populates="company", cascade="all, delete-orphan")
    addresses = relationship("Address", back_populates="company", cascade="all, delete-orphan")
    responsible_persons = relationship("ResponsiblePerson", back_populates="company", cascade="all, delete-orphan")

class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    iik = Column(String) # Номер счёта
    bank_name = Column(String)
    bik = Column(String)
    currency = Column(String) # KZT, USD, etc.
    is_primary = Column(Boolean, default=False)
    
    company = relationship("Company", back_populates="bank_accounts")

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    full_address = Column(Text)
    is_legal = Column(Boolean, default=False)
    
    company = relationship("Company", back_populates="addresses")

class ResponsiblePerson(Base):
    __tablename__ = "responsible_persons"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    role = Column(String) # Director, Chief Accountant, etc.
    full_name = Column(String)
    gender = Column(String)
    birth_date = Column(Date)
    iin = Column(String)
    residency = Column(String)
    signature_stamp = Column(Text, nullable=True) # Base64 photo
    
    company = relationship("Company", back_populates="responsible_persons")

