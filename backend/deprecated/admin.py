from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse
import models
import auth
from database import SessionLocal
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

        db = SessionLocal()
        user = db.query(models.User).filter(models.User.email == username).first()
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
        if not token:
            return False
            
        # Optional: Verify user still exists and is admin
        # db = SessionLocal()
        # user = db.query(models.User).filter(models.User.email == token).first()
        # db.close()
        # return user and user.is_admin
        
        return True

authentication_backend = AdminAuth(secret_key=auth.SECRET_KEY)

class UserAdmin(ModelView, model=models.User):
    column_list = [models.User.id, models.User.username, models.User.email, models.User.is_admin, models.User.avatar]
    
    def format_avatar(m, a):
        # Use m.avatar directly to ensure we have the full data, in case 'a' is truncated
        avatar_data = m.avatar
        if avatar_data and len(str(avatar_data)) > 50: 
             return Markup(f'<img src="/users/{m.id}/avatar" width="50" height="50" style="border-radius: 50%; object-fit: cover;">')
        
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



    
