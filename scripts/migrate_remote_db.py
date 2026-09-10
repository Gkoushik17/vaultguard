#!/usr/bin/env python3
"""
Utility script to initialize and seed the remote PostgreSQL database on Render.
Usage:
    python scripts/migrate_remote_db.py "<YOUR_RENDER_EXTERNAL_DB_URL>"
"""

import sys
import os

def main():
    if len(sys.argv) < 2:
        print("Error: Missing database URL.")
        print("Usage: python scripts/migrate_remote_db.py \"<YOUR_RENDER_EXTERNAL_DB_URL>\"")
        sys.exit(1)

    db_url = sys.argv[1].strip()

    try:
        import psycopg2
    except ImportError:
        print("[Info] Installing psycopg2-binary for database connection...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
        import psycopg2

    print("[1/3] Connecting to remote Render PostgreSQL...")
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cursor = conn.cursor()
    print("Connected successfully!")

    # Read init.sql
    init_path = os.path.join(os.path.dirname(__file__), "..", "database", "init.sql")
    print(f"[2/3] Executing schema migrations from {init_path}...")
    with open(init_path, "r", encoding="utf-8") as f:
        init_sql = f.read()
    cursor.execute(init_sql)
    print("Tables, types, and indexes created successfully!")

    # Read seed.sql
    seed_path = os.path.join(os.path.dirname(__file__), "..", "database", "seed.sql")
    print(f"[3/3] Seeding test accounts from {seed_path}...")
    with open(seed_path, "r", encoding="utf-8") as f:
        seed_sql = f.read()
    cursor.execute(seed_sql)
    print("Accounts and merchants seeded successfully!")

    cursor.close()
    conn.close()
    print("\nDatabase initialization complete! Your Render database is ready.")

if __name__ == "__main__":
    main()
