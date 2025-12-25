from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse
from . import models
from . import auth
from .database import SessionLocal
import uuid
from markupsafe import Markup

class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        print("Admin login attempt")
        try:
            form = await request.form()
            print(f"Form data received: {form.keys()}")
        except Exception as e:
            print(f"Error parsing form: {e}")
            raise
            
        username = form.get("username")
        password = form.get("password")
        print(f"Login for: {username}")

        from sqlalchemy import or_
        db = SessionLocal()
        user = db.query(models.User).filter(
            or_(
                models.User.email == username,
                models.User.username == username
            )
        ).first()
        db.close()

        if user:
            print(f"User found. Admin? {user.is_admin}")
            valid_pass = auth.verify_password(password, user.hashed_password)
            print(f"Password valid? {valid_pass}")
            if valid_pass and user.is_admin:
                print("Login successful")
                request.session.update({"token": user.email})
                return True
        
        print("Login failed")
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        token = request.session.get("token")
        print(f"Auth check: session={request.session}, token={token}")
        if not token:
            return False
        return True

authentication_backend = AdminAuth(secret_key=auth.SECRET_KEY)

def render_avatar(user):
    if not user:
        return ""
    
    avatar_data = getattr(user, "avatar", None)
    if avatar_data and len(str(avatar_data)) > 50: 
         img_html = f'<img src="/api/v1/users/{user.id}/avatar" width="30" height="30" style="border-radius: 50%; object-fit: cover; margin-right: 8px;">'
    else:
        colors = [
            "#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", 
            "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50", 
            "#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6", 
            "#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"
        ]
        color = colors[hash(user.username or "") % len(colors)]
        initial = user.username[0].upper() if user.username else "?"
        img_html = f'<div style="width: 30px; height: 30px; border-radius: 50%; background-color: {color}; color: white; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; margin-right: 8px;">{initial}</div>'
    
    return Markup(f'<div style="display: flex; align-items: center;">{img_html}<span>{user.username}</span></div>')

def render_company_logo(company):
    if not company:
        return ""
    
    logo_data = getattr(company, "logo", None)
    if logo_data:
         img_html = f'<img src="{logo_data}" width="30" height="30" style="border-radius: 4px; object-fit: cover; margin-right: 8px;">'
    else:
        initial = company.name[0].upper() if company.name else "?"
        img_html = f'<div style="width: 30px; height: 30px; border-radius: 4px; background-color: #34495e; color: white; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; margin-right: 8px;">{initial}</div>'
    
    return Markup(f'<div style="display: flex; align-items: center; white-space: nowrap;">{img_html}<span>{company.bin_iin}</span></div>')

class UserAdmin(ModelView, model=models.User):
    column_list = [models.User.id, models.User.username, models.User.email, models.User.is_admin, models.User.avatar]
    
    def format_avatar(m, a):
        # Use m.avatar directly to ensure we have the full data, in case 'a' is truncated
        avatar_data = m.avatar
        if avatar_data and len(str(avatar_data)) > 50: 
             return Markup(f'<img src="/api/v1/users/{m.id}/avatar" width="50" height="50" style="border-radius: 50%; object-fit: cover;">')
        
        # Consistent color based on username
        colors = [
            "#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", 
            "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50", 
            "#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6", 
            "#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"
        ]
        color = colors[hash(m.username or "") % len(colors)]
        initial = m.username[0].upper() if m.username else "?"
        return Markup(f'<div style="width: 50px; height: 50px; border-radius: 50%; background-color: {color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px;" title="No Avatar">{initial}</div>')

    column_formatters = {
        models.User.avatar: format_avatar
    }
    form_excluded_columns = [models.User.avatar, models.User.token_version]
    column_searchable_list = [models.User.email, models.User.username]
    column_sortable_list = [models.User.id, models.User.email]
    icon = "fa-solid fa-user"
    name = "Пользователь"
    name_plural = "Пользователи"
    
    async def on_model_change(self, data, model, is_created, request):
        password = data.get("hashed_password")
        if password and not password.startswith("$argon2"):
            data["hashed_password"] = auth.get_password_hash(password)
            # Invalidate tokens for this user
            # Since 'data' updates the model, we need to set the token_version
            # We need to know current version, but 'data' is a dict of strings/values from form.
            # We can't easily read the current value from 'model' if it's not loaded yet or if we are just updating a dict.
            # But sqladmin passes the 'model' instance if it's an update.
            
            # If model exists (update), increment version. If create, default is 1.
            current_ver = getattr(model, "token_version", 0) or 1
            data["token_version"] = current_ver + 1



    
class CompanyAdmin(ModelView, model=models.Company):
    column_list = [
        models.Company.id, 
        models.Company.name, 
        models.Company.type, 
        models.Company.bin_iin, 
        models.Company.owner
    ]
    
    def format_owner(m, a):
        return render_avatar(m.owner)

    column_formatters = {
        models.Company.owner: format_owner
    }
    
    column_details_list = "__all__"
    column_searchable_list = [models.Company.name, models.Company.bin_iin]
    icon = "fa-solid fa-building"
    name = "Компания"
    name_plural = "Компании"

class BankAccountAdmin(ModelView, model=models.BankAccount):
    column_list = [models.BankAccount.id, models.BankAccount.bank_name, models.BankAccount.iik, models.BankAccount.currency, models.BankAccount.company]
    
    def format_company(m, a):
        return render_company_logo(m.company)

    column_formatters = {
        models.BankAccount.company: format_company
    }
    
    icon = "fa-solid fa-credit-card"
    name = "Банковский счет"
    name_plural = "Банковские счета"

class AddressAdmin(ModelView, model=models.Address):
    column_list = [models.Address.id, models.Address.full_address, models.Address.is_legal, models.Address.company]
    
    def format_company(m, a):
        return render_company_logo(m.company)

    column_formatters = {
        models.Address.company: format_company
    }
    
    icon = "fa-solid fa-map-pin"
    name = "Адрес"
    name_plural = "Адреса"

class ResponsiblePersonAdmin(ModelView, model=models.ResponsiblePerson):
    column_list = [models.ResponsiblePerson.id, models.ResponsiblePerson.full_name, models.ResponsiblePerson.role, models.ResponsiblePerson.company]
    
    def format_company(m, a):
        return render_company_logo(m.company)

    column_formatters = {
        models.ResponsiblePerson.signature_stamp: "Signature",
        models.ResponsiblePerson.company: format_company
    }
    
    column_labels = {
        models.ResponsiblePerson.signature_stamp: "Signature"
    }
    icon = "fa-solid fa-user-tie"
    name = "Ответственное лицо"
