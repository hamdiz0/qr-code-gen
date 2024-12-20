from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import qrcode
from io import BytesIO
import psycopg2
import os
from fastapi.responses import StreamingResponse
import logging
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI()

CORS_ORIGIN = os.getenv("CORS_ORIGIN") 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# PostgreSQL configuration
db_host = os.getenv('POSTGRES_HOST')
db_name = os.getenv('POSTGRES_DB')
db_user = os.getenv('POSTGRES_USER')
db_password = os.getenv('POSTGRES_PASSWORD')
db_port = os.getenv('POSTGRES_PORT')

# Database connection
try:
    conn = psycopg2.connect(
        host=db_host,
        database=db_name,
        user=db_user,
        password=db_password,
        port=db_port
    )
    logging.info("Database connection established successfully.")
except Exception as e:
    logging.error(f"Database connection failed: {e}")

# Logging configuration
logging.basicConfig(level=logging.INFO)

# Check if the QR code exists
def check_qr_code_exists(url: str):
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT qr_code_image FROM url_qr WHERE url = %s;", (url,))
            result = cur.fetchone()
            return result[0] if result else None
    except Exception as e:
        logging.error(f"Error checking QR code existence: {e}")
        return None

@app.post("/generate-qr/")
async def generate_qr(url: str = Query(..., description="The URL to encode in the QR code")):

    # Check if the QR code already exists for the given URL
    with conn.cursor() as cur:
        cur.execute("SELECT qr_code_image FROM qr_codes WHERE url = %s;", (url,))
        existing_qr = cur.fetchone()

    if existing_qr:
        # If it exists, return the existing QR code
        print("it's in db ! ,retrieving ..." , existing_qr)
        img_byte_arr = BytesIO(existing_qr[0])
        img_byte_arr.seek(0)
        return StreamingResponse(img_byte_arr, media_type="image/png")
    else :
        print("it's not in db ! ,creating ...")
        # Generate QR Code since it does not exist
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save QR Code to BytesIO object
        img_byte_arr = BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)

        logging.info(f"QR Code generated for URL: {url}, Image bytes length: {len(img_byte_arr.getvalue())}")

        try:
            # Store QR code in PostgreSQL
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO qr_codes (url, qr_code_image) VALUES (%s, %s) RETURNING id;
                """, (url, img_byte_arr.getvalue()))
                conn.commit()

            # Return the newly generated QR code
            return StreamingResponse(img_byte_arr, media_type="image/png")
        except Exception as e:
            logging.error(f"Database error: {e}")  # Log the error for debugging
            raise HTTPException(status_code=500, detail=str(e))

