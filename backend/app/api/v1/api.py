from fastapi import APIRouter
from .endpoints import users, companies

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])
