import os
import json
import time
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "portfolio")

supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY and not SUPABASE_URL.startswith("https://your-project") and not SUPABASE_KEY.startswith("your_supabase"):
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"✓ [Supabase Client] Connected to cloud database at {SUPABASE_URL}")
    except Exception as e:
        print(f"❌ [Supabase Warning] Could not initialize client: {e}")
        supabase = None
else:
    print("ℹ [Supabase Status] Using Local Persistent Database (db.json).")

# Default fallback data in case Supabase or local storage is empty
FALLBACK_DATA = {
    "projects": [
        {
            "id": "proj-1",
            "title": "Neural Telemetry Analyzer",
            "description": "Deep learning system for real-time sensor anomaly detection using PyTorch.",
            "tech_stack": ["Python", "PyTorch", "Pandas", "Scikit-Learn"],
            "github_url": "https://github.com/krishnagoyal597/neural-telemetry",
            "live_url": "https://neural-telemetry-demo.vercel.app",
            "featured": True,
            "created_at": "2026-01-15T00:00:00Z"
        },
        {
            "id": "proj-2",
            "title": "Autonomous Data Pipeline",
            "description": "ETL pipeline automating large scale data extraction and classification.",
            "tech_stack": ["Python", "SQL", "Flask", "Supabase"],
            "github_url": "https://github.com/krishnagoyal597/data-pipeline",
            "live_url": "https://data-pipeline-demo.vercel.app",
            "featured": True,
            "created_at": "2026-02-10T00:00:00Z"
        }
    ],
    "skills": [
        {"id": "sk-1", "name": "Python", "category": "Programming", "proficiency": 92},
        {"id": "sk-2", "name": "Machine Learning", "category": "AI/ML", "proficiency": 88},
        {"id": "sk-3", "name": "Data Analytics", "category": "Databases", "proficiency": 90},
        {"id": "sk-4", "name": "SQL & PostgreSQL", "category": "Databases", "proficiency": 85},
        {"id": "sk-5", "name": "Flask & Web APIs", "category": "Web", "proficiency": 82}
    ],
    "certifications": [
        {
            "id": "cert-1",
            "name": "Machine Learning Specialization",
            "platform": "Coursera / DeepLearning.AI",
            "date_earned": "2025-11-20",
            "certificate_url": "#",
            "image_url": "assets/images/cert-ml.svg"
        },
        {
            "id": "cert-2",
            "name": "Python for Data Science & AI",
            "platform": "IBM / DataCamp",
            "date_earned": "2025-08-14",
            "certificate_url": "#",
            "image_url": "assets/images/cert-python.svg"
        }
    ],
    "experience": [
        {
            "id": "exp-1",
            "company": "GLA University AI Lab",
            "role": "Student AI Researcher",
            "start_date": "2025-09-01",
            "end_date": None,
            "is_current": True,
            "description": ["Developing predictive data models using Python.", "Collaborating on machine learning benchmarking."]
        }
    ],
    "achievements": [
        {
            "id": "ach-1",
            "title": "National AI Hackathon Top 10 Finalist",
            "category": "Competition",
            "date_achieved": "2025-10-15",
            "description": "Developed an autonomous real-time anomaly detection pipeline using PyTorch.",
            "image_url": "assets/images/cert-ml.svg"
        },
        {
            "id": "ach-2",
            "title": "GLA University Academic Excellence Award",
            "category": "Academic",
            "date_achieved": "2025-12-01",
            "description": "Recognized for top percentile performance in AI & Data Analytics coursework.",
            "image_url": "assets/images/cert-python.svg"
        }
    ],
    "academics": [
        {
            "id": "acad-1",
            "semester": "Semester 1 (Fall 2025)",
            "degree_program": "B.Tech AI & Data Analytics",
            "sgpa_cgpa": "9.20 SGPA",
            "percentage": "87.5%",
            "session_year": "2025-2026",
            "subjects": "Python Programming, Linear Algebra, Discrete Mathematics, Digital Systems",
            "marksheet_url": ""
        }
    ],
    "links": {
        "github": "https://github.com/krishnagoyal597",
        "linkedin": "https://linkedin.com/in/krishnagoyal",
        "twitter": "https://twitter.com/krishnagoyal",
        "resume_url": "https://example.com/resume.pdf"
    },
    "meta": {
        "tagline": "AI & Data Analytics Student | Builder | Learner @ GLA University",
        "bio": "I am Krishna, a first-year B.Tech student specializing in Artificial Intelligence & Data Analytics at GLA University. I am passionate about building intelligent systems and solving real-world problems with data.",
        "resume_summary": "> Name: Krishna\n> Degree: B.Tech AI & Data Analytics\n> University: GLA University\n> Status: First Year | Class of 2029\n> Skills: Python, ML, Data Analytics, SQL, Linear Algebra\n> Open To: Internships ✓",
        "profile_photo_url": "assets/images/profile.svg"
    }
}

DB_FILE = os.path.join(os.path.dirname(__file__), "db.json")

def load_local_db():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                saved_data = json.load(f)
                if isinstance(saved_data, dict):
                    FALLBACK_DATA.update(saved_data)
                    print(f"✓ [DB Local Load] Loaded persisted data from {DB_FILE}")
        except Exception as e:
            print(f"❌ [DB Local Error] Could not load {DB_FILE}: {e}")

def save_local_db():
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(FALLBACK_DATA, f, indent=2)
            print(f"✓ [DB Local Save] Saved updated database to {DB_FILE}")
    except Exception as e:
        print(f"❌ [DB Local Error] Could not save {DB_FILE}: {e}")

# Load persisted local database on module import
load_local_db()


def upload_file_to_storage(file_bytes: bytes, filename: str, content_type: str = "image/jpeg", bucket_name: str = None) -> dict:
    """Upload a file to Supabase Storage and return its public URL"""
    bucket = bucket_name or os.getenv("SUPABASE_STORAGE_BUCKET", "portfolio")
    clean_name = "".join(c if c.isalnum() or c in "._-" else "_" for c in filename)
    file_path = f"uploads/{int(time.time())}_{clean_name}"

    if not supabase:
        return {"status": "error", "message": "Supabase client not connected"}

    try:
        supabase.storage.from_(bucket).upload(
            file_path,
            file_bytes,
            {"content-type": content_type, "upsert": "true"}
        )
        public_url = supabase.storage.from_(bucket).get_public_url(file_path)
        return {
            "status": "success",
            "url": public_url,
            "filename": file_path,
            "bucket": bucket,
            "source": "supabase_storage"
        }
    except Exception as e:
        print(f"[Supabase Storage Upload Warning] Bucket: {bucket}, Error: {e}")
        return {"status": "error", "message": str(e), "bucket": bucket}


def fetch_all_data() -> dict:
    """Fetch all tables and return as a single dictionary"""
    if not supabase:
        return FALLBACK_DATA

    try:
        projects_data = supabase.table("projects").select("*").order("created_at", desc=True).execute().data
        skills_data = supabase.table("skills").select("*").order("category").execute().data
        certs_data = supabase.table("certifications").select("*").order("date_earned", desc=True).execute().data
        exp_data = supabase.table("experience").select("*").order("start_date", desc=True).execute().data
        ach_data = supabase.table("achievements").select("*").order("date_achieved", desc=True).execute().data

        try:
            acad_data = supabase.table("academics").select("*").order("created_at", desc=True).execute().data
        except Exception:
            acad_data = FALLBACK_DATA.get("academics", [])

        links_rows = supabase.table("links").select("*").execute().data
        links_dict = {row["key"]: row["value"] for row in links_rows} if links_rows else FALLBACK_DATA["links"]

        meta_rows = supabase.table("meta").select("*").execute().data
        meta_dict = {row["key"]: row["value"] for row in meta_rows} if meta_rows else FALLBACK_DATA["meta"]

        return {
            "projects": projects_data if projects_data else FALLBACK_DATA["projects"],
            "skills": skills_data if skills_data else FALLBACK_DATA["skills"],
            "certifications": certs_data if certs_data else FALLBACK_DATA["certifications"],
            "experience": exp_data if exp_data else FALLBACK_DATA["experience"],
            "achievements": ach_data if ach_data else FALLBACK_DATA["achievements"],
            "academics": acad_data if acad_data else FALLBACK_DATA.get("academics", []),
            "links": links_dict,
            "meta": meta_dict,
        }
    except Exception as e:
        print(f"[Supabase Fetch Error] {e}")
        return FALLBACK_DATA


def fetch_table(table_name: str) -> list:
    """Fetch all rows from a single table"""
    if not supabase:
        data = FALLBACK_DATA.get(table_name, [])
        if isinstance(data, dict):
            return [{"key": k, "value": v} for k, v in data.items()]
        return data

    try:
        return supabase.table(table_name).select("*").execute().data
    except Exception as e:
        print(f"[Supabase Fetch Table Error] {e}")
        data = FALLBACK_DATA.get(table_name, [])
        if isinstance(data, dict):
            return [{"key": k, "value": v} for k, v in data.items()]
        return data


def insert_row(table_name: str, data: dict) -> dict:
    """Insert a new row into a table and persist to DB"""
    # 1. Update local state
    if table_name in FALLBACK_DATA and isinstance(FALLBACK_DATA[table_name], list):
        new_item = {"id": f"item-{len(FALLBACK_DATA[table_name]) + 1}", **data}
        FALLBACK_DATA[table_name].append(new_item)
    elif table_name in ["meta", "links"] and isinstance(FALLBACK_DATA[table_name], dict):
        if "key" in data and "value" in data:
            FALLBACK_DATA[table_name][data["key"]] = data["value"]

    # 2. Save local disk DB
    save_local_db()

    if not supabase:
        print(f"[DB Insert] Table: {table_name}, Data: {data}")
        return {"status": "persisted_locally", "data": data}

    try:
        if table_name in ["meta", "links"] and "key" in data:
            res = supabase.table(table_name).upsert(data, on_conflict="key").execute()
        else:
            res = supabase.table(table_name).insert(data).execute()
        return res.data
    except Exception as e:
        print(f"[Supabase Insert Error] {e}")
        return {"status": "fallback_inserted", "data": data}


def update_row(table_name: str, row_id: str, data: dict) -> dict:
    """Update a row by ID in a table and persist to DB"""
    if table_name in FALLBACK_DATA and isinstance(FALLBACK_DATA[table_name], list):
        for idx, item in enumerate(FALLBACK_DATA[table_name]):
            if str(item.get("id")) == str(row_id):
                FALLBACK_DATA[table_name][idx].update(data)

    save_local_db()

    if not supabase:
        print(f"[DB Update] Table: {table_name}, ID: {row_id}, Data: {data}")
        return {"status": "persisted_locally", "row_id": row_id, "data": data}

    try:
        res = supabase.table(table_name).update(data).eq("id", row_id).execute()
        return res.data
    except Exception as e:
        print(f"[Supabase Update Error] {e}")
        return {"status": "fallback_updated", "row_id": row_id}


def delete_row(table_name: str, row_id: str) -> dict:
    """Delete a row by ID from a table and persist to DB"""
    print(f"[DB Delete] Table: {table_name}, ID: {row_id}")
    if table_name in FALLBACK_DATA and isinstance(FALLBACK_DATA[table_name], list):
        FALLBACK_DATA[table_name] = [
            item for item in FALLBACK_DATA[table_name]
            if str(item.get("id")) != str(row_id)
        ]

    save_local_db()

    if not supabase:
        return {"status": "persisted_locally", "row_id": row_id}

    try:
        res = supabase.table(table_name).delete().eq("id", row_id).execute()
        return res.data
    except Exception as e:
        print(f"[Supabase Delete Error] {e}")
        return {"status": "fallback_deleted", "row_id": row_id}


def upsert_meta(key: str, value: str) -> dict:
    """Upsert key/value into meta table and persist to DB"""
    if "meta" in FALLBACK_DATA and isinstance(FALLBACK_DATA["meta"], dict):
        FALLBACK_DATA["meta"][key] = value
    save_local_db()

    if not supabase:
        return {"key": key, "value": value}

    try:
        res = supabase.table("meta").upsert({"key": key, "value": value, "updated_at": "now()"}, on_conflict="key").execute()
        return res.data
    except Exception as e:
        print(f"[Supabase Upsert Meta Error] {e}")
        return {"key": key, "value": value}


def upsert_link(key: str, value: str) -> dict:
    """Upsert key/value into links table and persist to DB"""
    if "links" in FALLBACK_DATA and isinstance(FALLBACK_DATA["links"], dict):
        FALLBACK_DATA["links"][key] = value
    save_local_db()

    if not supabase:
        return {"key": key, "value": value}

    try:
        res = supabase.table("links").upsert({"key": key, "value": value, "updated_at": "now()"}, on_conflict="key").execute()
        return res.data
    except Exception as e:
        print(f"[Supabase Upsert Link Error] {e}")
        return {"key": key, "value": value}
