from fastapi import FastAPI, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqladmin import Admin
from .api.v1.api import api_router
from . import models, database, admin

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Inventory Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.middleware.sessions import SessionMiddleware
app.add_middleware(
    SessionMiddleware, 
    secret_key=admin.auth.SECRET_KEY,
    same_site="lax",
    https_only=False
)

app.include_router(api_router, prefix="/api/v1")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    print(f"Validation Error: {errors}")
    return JSONResponse(
        status_code=422,
        content={"detail": errors},
    )

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(content=b"", media_type="image/x-icon")

# Admin setup
admin_app = Admin(app, database.engine, authentication_backend=admin.authentication_backend)
admin_app.add_view(admin.UserAdmin)
admin_app.add_view(admin.CompanyAdmin)
admin_app.add_view(admin.BankAccountAdmin)
admin_app.add_view(admin.AddressAdmin)
admin_app.add_view(admin.ResponsiblePersonAdmin)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Inventory Management System API"}
