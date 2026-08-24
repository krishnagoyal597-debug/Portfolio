import os
import sys
import time

# Ensure server directory is in Python path for Vercel deployment imports
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
from dotenv import load_dotenv

from auth import require_auth, check_password, generate_token
from supabase_client import (
    fetch_table,
    fetch_all_data,
    insert_row,
    update_row,
    delete_row,
    upsert_meta,
    upsert_link,
    upload_file_to_storage
)
from gemini_client import generate_portfolio_content
from generate_portfolio import generate

load_dotenv()

STATIC_FOLDER = os.path.normpath(os.path.join(BASE_DIR, "../"))

# On Vercel (and other serverless platforms), /var/task is read-only.
# The ONLY writable directory is /tmp — always use it for uploads.
TMP_UPLOADS = "/tmp/uploads"
os.makedirs(TMP_UPLOADS, exist_ok=True)

# Keep a local uploads folder as a secondary attempt (works locally)
LOCAL_UPLOADS = os.path.join(STATIC_FOLDER, "assets/uploads")
try:
    os.makedirs(LOCAL_UPLOADS, exist_ok=True)
except Exception:
    LOCAL_UPLOADS = None

# Primary uploads folder: always /tmp in production
UPLOADS_FOLDER = TMP_UPLOADS

app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path="")
CORS(app, origins=["*"])
app.secret_key = os.getenv("FLASK_SECRET_KEY", "flask_secret_krishna_2029")

ALLOWED_TABLES = ["projects", "skills", "certifications", "experience", "achievements", "academics", "messages", "links", "meta"]
 

# ─── FILE UPLOAD API ─────────────────────────────────────

@app.route("/api/upload", methods=["POST"])
def upload_file():
    """
    Unified File Upload API with Supabase Storage Bucket integration + Base64 Fallback.
    Uploads directly to Supabase Storage bucket if accessible, otherwise falls back gracefully.
    """
    try:
        if "file" not in request.files:
            return jsonify({"status": "error", "message": "No file part in request"}), 400
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"status": "error", "message": "No selected file"}), 400

        file_bytes = file.read()
        content_type = file.content_type or ("application/pdf" if file.filename.endswith(".pdf") else "image/jpeg")
        bucket_name = request.form.get("bucket") or os.getenv("SUPABASE_STORAGE_BUCKET", "portfolio")

        raw_name = file.filename or "upload.jpg"
        safe_name = "".join(c if c.isalnum() or c in "._-" else "_" for c in raw_name)

        # 1. Attempt Supabase Storage Upload
        storage_res = upload_file_to_storage(file_bytes, safe_name, content_type, bucket_name)
        if storage_res.get("status") == "success" and storage_res.get("url"):
            return jsonify({
                "status": "success",
                "url": storage_res["url"],
                "filename": storage_res["filename"],
                "bucket": storage_res["bucket"],
                "source": "supabase_storage"
            })

        # 2. Fallback: Convert to Base64 data URL so upload is NEVER lost
        import base64
        b64 = base64.b64encode(file_bytes).decode("utf-8")
        data_url = f"data:{content_type};base64,{b64}"
        filename = f"upload_{int(time.time())}_{safe_name}"

        return jsonify({
            "status": "success",
            "url": data_url,
            "filename": filename,
            "source": "base64_fallback"
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/files/<path:filename>", methods=["GET"])
def serve_uploaded_file(filename):
    """Serve uploaded files from /tmp/uploads (works on Vercel serverless)"""
    # Try /tmp first (Vercel), then local assets/uploads (local dev)
    tmp_path = os.path.join(TMP_UPLOADS, filename)
    if os.path.exists(tmp_path):
        from flask import send_file
        return send_file(tmp_path)
    if LOCAL_UPLOADS:
        local_path = os.path.join(LOCAL_UPLOADS, filename)
        if os.path.exists(local_path):
            from flask import send_file
            return send_file(local_path)
    return jsonify({"error": "File not found"}), 404


# ─── PUBLIC DYNAMIC ROUTES ───────────────────────────────

@app.route("/")
@app.route("/index.html")
def serve_portfolio():
    """Dynamically render the portfolio homepage live on every request"""
    try:
        # 1. Fetch live data directly from Supabase DB
        db_data = fetch_all_data()
        
        # 2. Get AI generated copy or fallbacks
        ai_copy = generate_portfolio_content(db_data)

        # 3. Read live Jinja2 HTML template
        template_path = os.path.join(BASE_DIR, "portfolio_template.html")
        if not os.path.exists(template_path):
            template_path = os.path.join(STATIC_FOLDER, "index.html")

        with open(template_path, "r", encoding="utf-8") as f:
            template_content = f.read()

        # 4. Render live dynamic HTML response
        rendered_html = render_template_string(
            template_content,
            projects=db_data.get("projects", []),
            skills=db_data.get("skills", []),
            certifications=db_data.get("certifications", []),
            experience=db_data.get("experience", []),
            achievements=db_data.get("achievements", []),
            academics=db_data.get("academics", []),
            links=db_data.get("links", {}),
            meta=db_data.get("meta", {}),
            ai=ai_copy
        )

        # Also sync static file on disk in background
        try:
            with open(os.path.join(STATIC_FOLDER, "index.html"), "w", encoding="utf-8") as out:
                out.write(rendered_html)
        except Exception:
            pass

        return rendered_html

    except Exception as e:
        print(f"[Dynamic Render Error] {e}")
        output_path = os.path.join(STATIC_FOLDER, "index.html")
        if os.path.exists(output_path):
            return send_from_directory(STATIC_FOLDER, "index.html")
        return f"<h1>Portfolio Server Error</h1><p>{str(e)}</p>", 500


@app.route("/admin")
def serve_dashboard():
    """Serve the admin mission control dashboard"""
    if os.path.exists(os.path.join(STATIC_FOLDER, "admin.html")):
        return send_from_directory(STATIC_FOLDER, "admin.html")
    return jsonify({"message": "Admin dashboard page not found."}), 404


@app.route("/api/public/all", methods=["GET"])
def get_all_public_data():
    """Public API endpoint returning all live database tables for frontend client rendering"""
    try:
        data = fetch_all_data()
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/public/<table_name>", methods=["GET"])
def get_public_table(table_name):
    """Public API endpoint returning a specific table"""
    if table_name not in ALLOWED_TABLES:
        return jsonify({"error": f"Table '{table_name}' not allowed"}), 404
    try:
        rows = fetch_table(table_name)
        return jsonify({"status": "success", "data": rows})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/contact", methods=["POST"])
def submit_contact_message():
    """Public API endpoint for contact form submissions"""
    try:
        data = request.get_json() or {}
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        message = data.get("message", "").strip()

        if not name or not email or not message:
            return jsonify({"status": "error", "message": "Name, email, and message are required."}), 400

        result = insert_row("messages", {
            "name": name,
            "email": email,
            "message": message
        })
        return jsonify({"status": "success", "message": "Message transmitted successfully!", "data": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ─── AUTH ROUTES ─────────────────────────────────────────

@app.route("/api/login", methods=["POST"])
def login():
    """Admin login — returns JWT token on success"""
    data = request.get_json() or {}
    password = data.get("password", "")
    if check_password(password):
        token = generate_token()
        return jsonify({"status": "success", "token": token})
    return jsonify({"status": "error", "message": "Invalid password"}), 401


# ─── DATA ROUTES (Admin & API Management) ─────────────────

@app.route("/api/data/<table_name>", methods=["GET"])
def get_table(table_name):
    """Get all rows from a database table"""
    if table_name not in ALLOWED_TABLES:
        return jsonify({"error": f"Table '{table_name}' not allowed"}), 404
    rows = fetch_table(table_name)
    return jsonify({"status": "success", "data": rows})


@app.route("/api/data/<table_name>", methods=["POST"])
def add_row(table_name):
    """Insert a new row into a database table"""
    if table_name not in ALLOWED_TABLES:
        return jsonify({"error": f"Table '{table_name}' not allowed"}), 404

    try:
        data = request.get_json(force=True) or {}
    except Exception as parse_err:
        print(f"[API POST] JSON parse error for {table_name}: {parse_err}")
        return jsonify({"status": "error", "message": f"Invalid JSON: {parse_err}"}), 400

    if table_name == "meta" and "key" in data and "value" in data:
        print(f"[API POST meta] key={data['key']}, value_len={len(str(data['value']))}")
        result = upsert_meta(data["key"], data["value"])
    elif table_name == "links" and "key" in data and "value" in data:
        result = upsert_link(data["key"], data["value"])
    else:
        result = insert_row(table_name, data)

    # Regenerate static index.html on disk automatically
    try:
        generate()
    except Exception:
        pass

    return jsonify({"status": "success", "data": result})


@app.route("/api/data/<table_name>/<row_id>", methods=["PUT"])
def edit_row(table_name, row_id):
    """Update a row in a database table"""
    if table_name not in ALLOWED_TABLES:
        return jsonify({"error": f"Table '{table_name}' not allowed"}), 404
    data = request.get_json() or {}
    result = update_row(table_name, row_id, data)

    try:
        generate()
    except Exception:
        pass

    return jsonify({"status": "success", "data": result})


@app.route("/api/data/<table_name>/<row_id>", methods=["DELETE"])
def remove_row(table_name, row_id):
    """Delete a row from a database table"""
    if table_name not in ALLOWED_TABLES:
        return jsonify({"error": f"Table '{table_name}' not allowed"}), 404
    result = delete_row(table_name, row_id)

    try:
        generate()
    except Exception:
        pass

    return jsonify({"status": "success", "data": result})


# ─── PORTFOLIO REGENERATION ──────────────────────────────

@app.route("/api/regenerate", methods=["POST", "GET"])
def regenerate():
    """Trigger Python portfolio generation script manually"""
    try:
        result = generate()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


import socket

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0

def find_open_port(preferred_port: int, max_attempts: int = 10) -> int:
    for p in range(preferred_port, preferred_port + max_attempts):
        if not is_port_in_use(p):
            return p
    return preferred_port

# ─── RUN SERVER ──────────────────────────────────────────

if __name__ == "__main__":
    requested_port = int(os.getenv("PORT", 5001))
    port = find_open_port(requested_port)
    debug = os.getenv("FLASK_ENV", "development") == "development"
    print(f"🚀 Starting Dynamic Mission Control Server on port {port} (http://localhost:{port}) (debug={debug})...")
    app.run(host="0.0.0.0", port=port, debug=debug)
