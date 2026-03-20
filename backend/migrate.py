import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    print("No DATABASE_URL found.")
    exit(1)

try:
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    cur.execute("ALTER TABLE riders ADD COLUMN IF NOT EXISTS average_daily_income INTEGER DEFAULT 900;")
    conn.commit()
    print("Migration successful: added average_daily_income to riders.")
except Exception as e:
    print(f"Migration failed: {e}")
finally:
    if 'conn' in locals() and conn:
        conn.close()
