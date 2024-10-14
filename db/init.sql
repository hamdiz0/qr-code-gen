CREATE TABLE qr_codes (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,  -- Ensure the url is unique
    qr_code_image BYTEA NOT NULL
);
