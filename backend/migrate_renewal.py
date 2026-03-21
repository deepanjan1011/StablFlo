"""
migrate_renewal.py — One-off migration to add subscription_id columns
needed for the Policy Expiration & Auto-Renewal feature.

Works with both SQLite (fallback) and PostgreSQL (Supabase).

Run once:
    cd backend
    source venv/bin/activate.fish && python migrate_renewal.py
"""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

def column_exists_pg(cur, table: str, column: str) -> bool:
    cur.execute(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name=%s AND column_name=%s",
        (table, column)
    )
    return cur.fetchone() is not None

def run_postgres():
    import psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()

    if not column_exists_pg(cur, "riders", "subscription_id"):
        cur.execute("ALTER TABLE riders ADD COLUMN subscription_id TEXT;")
        print("[MIGRATE] Added subscription_id to riders table (PostgreSQL)")
    else:
        print("[MIGRATE] riders.subscription_id already exists — skipping")

    if not column_exists_pg(cur, "policies", "subscription_id"):
        cur.execute("ALTER TABLE policies ADD COLUMN subscription_id TEXT;")
        print("[MIGRATE] Added subscription_id to policies table (PostgreSQL)")
    else:
        print("[MIGRATE] policies.subscription_id already exists — skipping")

    cur.close()
    conn.close()
    print("[MIGRATE] Done.")

def run_sqlite():
    import sqlite3
    DB_PATH = os.path.join(os.path.dirname(__file__), "stablflo.db")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("PRAGMA table_info(riders)")
    if "subscription_id" not in [row[1] for row in cur.fetchall()]:
        cur.execute("ALTER TABLE riders ADD COLUMN subscription_id TEXT;")
        print("[MIGRATE] Added subscription_id to riders table (SQLite)")
    else:
        print("[MIGRATE] riders.subscription_id already exists — skipping")

    cur.execute("PRAGMA table_info(policies)")
    if "subscription_id" not in [row[1] for row in cur.fetchall()]:
        cur.execute("ALTER TABLE policies ADD COLUMN subscription_id TEXT;")
        print("[MIGRATE] Added subscription_id to policies table (SQLite)")
    else:
        print("[MIGRATE] policies.subscription_id already exists — skipping")

    conn.commit()
    conn.close()
    print("[MIGRATE] Done.")

if __name__ == "__main__":
    if DATABASE_URL.startswith("postgresql"):
        run_postgres()
    else:
        run_sqlite()
