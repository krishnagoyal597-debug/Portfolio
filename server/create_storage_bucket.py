#!/usr/bin/env python3
"""
One-time setup: Create the 'portfolio-uploads' Supabase Storage bucket.
Run this once: python3 server/create_storage_bucket.py
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from supabase_client import supabase

if not supabase:
    print("❌ Supabase not connected. Check SUPABASE_URL and SUPABASE_KEY in .env")
    sys.exit(1)

BUCKET = "portfolio-uploads"

try:
    # Check if bucket already exists
    buckets = supabase.storage.list_buckets()
    existing = [b.name for b in buckets]
    if BUCKET in existing:
        print(f"✓ Bucket '{BUCKET}' already exists.")
    else:
        supabase.storage.create_bucket(BUCKET, options={"public": True})
        print(f"✓ Bucket '{BUCKET}' created successfully (public).")
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

print("✓ Storage setup complete. You can now upload files via /api/upload")
