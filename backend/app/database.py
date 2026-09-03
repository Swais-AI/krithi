import os
from contextlib import contextmanager
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool

pool = None

def get_pool():
    global pool
    if pool is None:
        database_url = os.getenv('DATABASE_URL')
        import urllib.parse
        result = urllib.parse.urlparse(database_url)
        pool = SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            host=result.hostname,
            port=result.port or 5432,
            database=result.path.lstrip('/'),
            user=result.username,
            password=result.password,
            sslmode='require'
        )
    return pool

@contextmanager
def get_db():
    pool = get_pool()
    conn = pool.getconn()
    try:
        yield conn
    finally:
        pool.putconn(conn)
