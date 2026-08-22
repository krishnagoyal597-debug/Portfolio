import os
import json
from datetime import datetime
from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader

from supabase_client import fetch_all_data
from gemini_client import generate_portfolio_content

load_dotenv()


def generate():
    """
    Main portfolio generation workflow:
    1. Reads all data from Supabase
    2. Calls Gemini API to generate copy
    3. Merges everything into context
    4. Injects into Jinja2 portfolio_template.html
    5. Writes output index.html
    """
    print("[1/4] Fetching data from Supabase...")
    portfolio_data = fetch_all_data()

    print("[2/4] Calling Gemini API for content generation...")
    ai_content = generate_portfolio_content(portfolio_data)

    print("[3/4] Merging data and AI content...")
    # Merge AI-generated summaries into project data
    for project in portfolio_data.get("projects", []):
        title = project.get("title", "")
        project["ai_summary"] = ai_content.get("project_summaries", {}).get(
            title, project.get("description", "")
        )

    # Build final context for Jinja2 template
    context = {
        **portfolio_data,
        "ai": ai_content,
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    print("[4/4] Rendering HTML template...")
    template_dir = os.path.dirname(os.path.abspath(__file__))
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template("portfolio_template.html")
    rendered_html = template.render(**context)

    output_path = os.getenv("PORTFOLIO_OUTPUT_PATH", "../index.html")
    if not os.path.isabs(output_path):
        output_path = os.path.normpath(os.path.join(template_dir, output_path))

    # Safely attempt to write output html on disk (may fail on read-only serverless filesystems like Vercel)
    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(rendered_html)
        print(f"✓ Portfolio generated → {output_path}")
    except Exception as e:
        print(f"ℹ [Serverless Note] Could not write index.html to disk: {e}")

    return {
        "status": "success",
        "output": output_path,
        "timestamp": context["generated_at"],
        "projects_count": len(portfolio_data.get("projects", [])),
        "skills_count": len(portfolio_data.get("skills", []))
    }


if __name__ == "__main__":
    result = generate()
    print(json.dumps(result, indent=2))
