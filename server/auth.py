import os
from datetime import datetime, timedelta
from functools import wraps
import jwt
from flask import request, jsonify
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "fallback_secret_krishna_2028")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


def generate_token() -> str:
    """Generate a JWT token valid for 24 hours"""
    payload = {
        "admin": True,
        "exp": datetime.utcnow() + timedelta(hours=24),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verify_token(token: str) -> bool:
    """Verify a JWT token"""
    if not token:
        return False
    try:
        jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return True
    except jwt.ExpiredSignatureError:
        return False
    except jwt.InvalidTokenError:
        return False


def require_auth(f):
    """Decorator to protect admin-only routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "").strip() if auth_header else ""
        if not token:
            # Fallback check query parameter or header X-Access-Token
            token = request.args.get("token") or request.headers.get("X-Access-Token", "")

        if not token or not verify_token(token):
            return jsonify({"status": "error", "message": "Unauthorized access. Valid JWT token required."}), 401
        return f(*args, **kwargs)

    return decorated


def check_password(password: str) -> bool:
    """Check if provided password matches admin password"""
    return password == ADMIN_PASSWORD
