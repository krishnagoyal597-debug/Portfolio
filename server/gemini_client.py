import os
import json
# pyrefly: ignore [missing-import]
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

model = None
if GEMINI_API_KEY and not GEMINI_API_KEY.startswith("your_google"):
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        for m in ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-flash-latest", "gemini-2.5-flash"]:
            try:
                model = genai.GenerativeModel(m)
                break
            except Exception:
                pass
    except Exception as e:
        print(f"[Gemini Warning] Could not configure Gemini API: {e}")
        model = None


def generate_portfolio_content(portfolio_data: dict) -> dict:
    """
    Send all portfolio data to Gemini and get back generated content
    for each section. Returns a dict with AI-generated text.
    """
    fallback_result = {
        "hero_tagline": "AI & Data Analytics Student | Machine Learning Developer | GLA University",
        "bio": "I am Krishna, a first-year B.Tech student specializing in Artificial Intelligence & Data Analytics at GLA University. I am passionate about building intelligent systems and solving real-world problems with data. Currently exploring deep learning, Python, and data engineering.",
        "resume_summary": "> Name: Krishna\n> Degree: B.Tech AI & Data Analytics\n> University: GLA University\n> Status: First Year | Class of 2029\n> Core Skills: Python, Machine Learning, SQL, PyTorch, Data Analytics\n> Open To: Summer Internships & Research Projects ✓",
        "skills_intro": "Technologies, frameworks, and data platforms I work with",
        "project_summaries": {
            proj.get("title", ""): proj.get("description", "")
            for proj in portfolio_data.get("projects", [])
        },
        "contact_tagline": "Have an exciting project or internship opportunity? Let's build together."
    }

    if not model:
        print("[Gemini API] GEMINI_API_KEY not configured. Using fallback copy.")
        return fallback_result

    prompt = f"""
You are a professional portfolio copywriter. Given the following data about a
student named Krishna who is a first-year B.Tech student specializing in
Artificial Intelligence & Data Analytics at GLA University, generate compelling
content for their portfolio website.

Here is Krishna's raw data:
{json.dumps(portfolio_data, indent=2, default=str)}

Generate the following and return ONLY a valid JSON object with these exact keys:

{{
  "hero_tagline": "A single punchy one-liner (max 12 words) for the hero section",
  "bio": "A 3-sentence professional bio in first person for the About section. Make it engaging, honest, and forward-looking. Highlight AI/Data Analytics focus.",
  "resume_summary": "A terminal-style summary. Format it as 8-10 lines each starting with '> ' covering: name, degree, university, top 5 skills, project count, certifications count, and open-to-internships status.",
  "skills_intro": "One sentence (max 20 words) introducing the skills section",
  "project_summaries": {{
    "PROJECT_TITLE_HERE": "One compelling sentence summary for each project"
  }},
  "contact_tagline": "One friendly line inviting visitors to reach out (max 15 words)"
}}

Return ONLY the JSON. No markdown. No explanation. No backticks.
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Clean up markdown code blocks if Gemini returns them
        if text.startswith("```"):
            lines = text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()

        parsed = json.loads(text)
        # Ensure all required keys exist
        for key in fallback_result:
            if key not in parsed:
                parsed[key] = fallback_result[key]
        return parsed

    except Exception as e:
        print(f"[Gemini Exception] {e}. Falling back to default copy.")
        return fallback_result
