import os
from dotenv import load_dotenv
from psycopg2.pool import SimpleConnectionPool
import psycopg2

# ================================
# Load Environment Variables
# ================================
load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_PORT = int(os.getenv("DB_PORT", 5432))

# ================================
# Validate Environment Variables
# ================================
required_vars = {
    "DB_USER": DB_USER,
    "DB_HOST": DB_HOST,
    "DB_NAME": DB_NAME,
    "DB_PASSWORD": DB_PASSWORD,
    "DB_PORT": DB_PORT,
}

missing = [key for key, value in required_vars.items() if not value]

if missing:
    raise ValueError(f"❌ Missing environment variables: {', '.join(missing)}")

# ================================
# Create PostgreSQL Connection Pool
# ================================
try:
    pool = SimpleConnectionPool(
        minconn=1,
        maxconn=10,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,

        # AWS RDS SSL
        sslmode="require",

        # Stability settings
        connect_timeout=15,
        keepalives=1,
        keepalives_idle=30,
        keepalives_interval=10,
        keepalives_count=5,
    )

    print("✅ PostgreSQL Connection Pool Created")

except Exception as err:
    print("🚨 Failed to create PostgreSQL connection pool")
    print(err)
    raise

# ================================
# Test Database Connection
# ================================
try:
    conn = pool.getconn()

    cursor = conn.cursor()
    cursor.execute("SELECT version();")

    print("✅ Successfully connected to AWS RDS PostgreSQL Database!")
    print(cursor.fetchone()[0])

    cursor.close()
    pool.putconn(conn)

except Exception as err:
    print("🚨 CRITICAL: Failed to connect to AWS RDS Database!")
    print("Check your .env credentials and AWS Security Group (Port 5432).")
    print("Error:", err)

# ================================
# Helper Functions
# ================================
def get_connection():
    """Get a database connection from the pool."""
    return pool.getconn()

def release_connection(conn):
    """Return the connection to the pool."""
    pool.putconn(conn)

def close_pool():
    """Close all connections in the pool."""
    pool.closeall()
    print("✅ Database pool closed")
