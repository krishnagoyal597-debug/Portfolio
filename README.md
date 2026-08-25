# Personal Resume Portfolio Backend

A high-performance, AI-assisted Python Flask backend for **Krishna** (2nd Year B.Tech student specializing in Artificial Intelligence & Data Analytics at GLA University).

This backend serves API endpoints consumed by the portfolio frontend (`index.html` and `admin.html`), interacts with a Supabase PostgreSQL database for content management, and leverages the Google Gemini 1.5 Flash API to automatically generate dynamic portfolio copy, summaries, and terminal specs.

---

## Tech Stack

- **Python 3.11+** — Core language
- **Flask (v3.0.0)** — Lightweight web server & API framework
- **supabase-py (v2.3.0)** — Supabase Python SDK for database queries
- **google-generativeai (v0.5.0)** — Google Gemini API client
- **python-dotenv (v1.0.0)** — Environment variable configuration
- **flask-cors (v4.0.0)** — Cross-Origin Resource Sharing for frontend calls
- **Jinja2 (v3.1.3)** — HTML templating engine
- **PyJWT (v2.8.0)** — JSON Web Token authentication for admin routes
- **Gunicorn (v21.2.0)** — Production WSGI HTTP Server

---

## File Structure

```
portfolio/
├── server/
│   ├── app.py                  ← Main Flask server & REST API endpoints
│   ├── supabase_client.py      ← Supabase database client & CRUD helpers
│   ├── gemini_client.py        ← Google Gemini API client & AI prompts
│   ├── generate_portfolio.py   ← Main portfolio compilation script
│   ├── auth.py                 ← JWT authentication & password verification
│   ├── portfolio_template.html ← Jinja2 HTML portfolio template
│   └── migrations/
│       └── 01_schema.sql       ← SQL schema DDL & Row Level Security policies
├── .env                        ← Local secrets & API keys (Git ignored)
├── .env.example                ← Environment template
├── requirements.txt            ← Python dependencies
└── README.md                   ← Project documentation & deployment guide
```

---

## Setup & Installation Instructions

### 1. Clone & Navigate to Project

```bash
cd portfolio
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your actual credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_or_service_key
GEMINI_API_KEY=your_google_gemini_api_key
ADMIN_PASSWORD=your_chosen_admin_password
JWT_SECRET=a_random_secret_string_for_jwt_signing
FLASK_SECRET_KEY=another_random_secret_string
PORTFOLIO_OUTPUT_PATH=../index.html
```

### 3. Run Supabase Database Migrations

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** tab.
3. Paste and run the contents of [`server/migrations/01_schema.sql`](server/migrations/01_schema.sql).
4. This creates the 7 required tables (`projects`, `skills`, `certifications`, `experience`, `links`, `meta`, `messages`) and configures Row Level Security (RLS) policies.

### 4. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 5. Run the Flask Server

```bash
python server/app.py
```

The server will start at `http://localhost:5000`.

---

## Available API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Serves public compiled `index.html` portfolio page | No |
| **GET** | `/admin` | Serves admin Mission Control dashboard | No |
| **POST** | `/api/contact` | Submit contact form message | No |
| **POST** | `/api/login` | Admin authentication — returns JWT token | No |
| **GET** | `/api/data/<table_name>` | Fetch all records from specified Supabase table | Yes (JWT) |
| **POST** | `/api/data/<table_name>` | Insert new record into specified Supabase table | Yes (JWT) |
| **PUT** | `/api/data/<table_name>/<row_id>` | Update record in Supabase table | Yes (JWT) |
| **DELETE** | `/api/data/<table_name>/<row_id>` | Delete record from Supabase table | Yes (JWT) |
| **POST** | `/api/regenerate` | Triggers Gemini AI content generation & HTML compile | Yes (JWT) |

---

## How to Regenerate the Portfolio

Whenever you add or modify projects, skills, certifications, or experience in Supabase:

1. Log into Mission Control dashboard at `http://localhost:5000/admin`.
2. Click **✨ REGENERATE PORTFOLIO (GEMINI AI)**.
3. Alternatively, trigger via cURL:

```bash
curl -X POST http://localhost:5000/api/regenerate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

The backend will:
1. Fetch latest data from Supabase.
2. Prompt Gemini API to generate crisp one-line summaries, terminal specs, and hero copy.
3. Render `portfolio_template.html` using Jinja2.
4. Output a clean, production-ready static `index.html`.

---

## Deployment Guide

### Option A: Render.com (Flask Backend API)

1. Create a **New Web Service** on Render connected to your Git repository.
2. Set Environment Details:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn server.app:app`
3. Add Environment Variables in Render Dashboard (`SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`, `ADMIN_PASSWORD`, `JWT_SECRET`, `FLASK_SECRET_KEY`).

### Option B: GitHub Pages (Static Portfolio Frontend)

1. Run portfolio generation (`python server/generate_portfolio.py`).
2. Commit the generated `index.html` to your `main` branch.
3. Go to **Repository Settings → Pages** on GitHub and select `Deploy from a branch` (`main` / root).
4. GitHub Pages will serve your high-performance static portfolio website globally.
