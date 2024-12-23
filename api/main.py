from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import qrcode
from io import BytesIO
import psycopg2
import os
import time
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

CORS_ORIGIN = os.getenv("CORS_ORIGIN")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# postgres configuration
db_host = os.getenv("POSTGRES_HOST")
db_name = os.getenv("POSTGRES_DB")
db_user = os.getenv("POSTGRES_USER")
db_password = os.getenv("POSTGRES_PASSWORD")
db_port = os.getenv("POSTGRES_PORT")

# wait for database creation
def wait_for_database():
    max_retries = 10
    retry_interval = 5
    retries = 0

    while retries < max_retries:
        try:
            conn = psycopg2.connect(
                host=db_host,
                database=db_name,
                user=db_user,
                password=db_password,
                port=db_port,
            )
            print("Database connection established successfully.")
            return conn
        except Exception as e:
            print(f"Database connection failed: {e}. Retrying in {retry_interval} seconds...")
            retries += 1
            time.sleep(retry_interval)

    raise Exception("Max retries exceeded. Database connection failed.")

# connect to db
conn = wait_for_database()

# table creation
def create_table():
    create_table_query = """
    CREATE TABLE IF NOT EXISTS qr_codes (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL UNIQUE,  -- Ensure the URL is unique
        qr_code_image BYTEA NOT NULL
    );
    """
    try:
        with conn.cursor() as cur:
            cur.execute(create_table_query)
            conn.commit()
    except Exception as e:
        print(f"Table creation failed: {e}")
        raise

create_table()

@app.post("/generate-qr/")
async def generate_qr(url: str = Query(..., description="The URL to encode in the QR code")):
    # check if qr code already exists
    with conn.cursor() as cur:
        cur.execute("SELECT qr_code_image FROM qr_codes WHERE url = %s;", (url,))
        existing_qr = cur.fetchone()

    if existing_qr:
        print("found in database. Retrieving...")
        img_byte_arr = BytesIO(existing_qr[0])
        img_byte_arr.seek(0)
        return StreamingResponse(img_byte_arr, media_type="image/png")
    else:
        print("not found in database. Generating new one...")
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        
        # save qr Code to BytesIO object
        img_byte_arr = BytesIO()
        img.save(img_byte_arr, format="PNG")
        img_byte_arr.seek(0)

        print(f"QR Code generated for URL: {url}, Image bytes length: {len(img_byte_arr.getvalue())}")

        try:
            # store qr code
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO qr_codes (url, qr_code_image) VALUES (%s, %s) RETURNING id;
                    """,
                    (url, img_byte_arr.getvalue()),
                )
                conn.commit()
            # return the generated qr code
            return StreamingResponse(img_byte_arr, media_type="image/png")
        except Exception as e:
            print(f"Database error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
@app.get("/")
def read_root():
    return {"message": "QR Code Generator API"}