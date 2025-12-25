from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    avatar: Optional[str] = None

class User(UserBase):
    id: int
    avatar: Optional[str] = None
    has_company: bool = False
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Company Related Schemas ---

class BankAccountBase(BaseModel):
    iik: str
    bank_name: str
    bik: str
    currency: str
    is_primary: bool = False

class BankAccountCreate(BankAccountBase):
    pass

class BankAccount(BankAccountBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class AddressBase(BaseModel):
    full_address: str
    is_legal: bool = False

class AddressCreate(AddressBase):
    pass

class Address(AddressBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ResponsiblePersonBase(BaseModel):
    role: str
    full_name: str
    gender: str
    birth_date: Optional[date] = None
    iin: str
    residency: str
    signature_stamp: Optional[str] = None

class ResponsiblePersonCreate(ResponsiblePersonBase):
    pass

class ResponsiblePerson(ResponsiblePersonBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class CompanyBase(BaseModel):
    name: str
    type: str
    bin_iin: str
    kbe: str
    vat_status: bool = False
    phone: str
    email: str
    website: Optional[str] = None
    logo: Optional[str] = None
    stamp: Optional[str] = None

class CompanyCreate(CompanyBase):
    bank_accounts: List[BankAccountCreate]
    addresses: List[AddressCreate]
    responsible_persons: List[ResponsiblePersonCreate]

class Company(CompanyBase):
    id: int
    bank_accounts: List[BankAccount]
    addresses: List[Address]
    responsible_persons: List[ResponsiblePerson]
    
    model_config = ConfigDict(from_attributes=True)

