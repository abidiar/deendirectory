-- Table: services

-- DROP TABLE services;

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    hours VARCHAR(255),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes

-- DROP INDEX IF EXISTS idx_services_category;

CREATE INDEX IF NOT EXISTS idx_services_category
    ON services USING btree
    (category COLLATE pg_catalog."default");

-- DROP INDEX IF EXISTS idx_services_name;

CREATE INDEX IF NOT EXISTS idx_services_name
    ON services USING btree
    (name COLLATE pg_catalog."default");

-- DROP INDEX IF EXISTS idx_services_updated_at;

CREATE INDEX IF NOT EXISTS idx_services_updated_at
    ON services USING btree
    (updated_at);

-- DROP INDEX IF EXISTS idx_services_website;

CREATE INDEX IF NOT EXISTS idx_services_website
    ON services USING btree
    (website COLLATE pg_catalog."default");

-- DROP INDEX IF EXISTS idx_services_created_at;

CREATE INDEX IF NOT EXISTS idx_services_created_at
    ON services USING btree
    (created_at);

-- DROP INDEX IF EXISTS idx_services_image_url;

CREATE INDEX IF NOT EXISTS idx_services_image_url
    ON services USING btree
    (image_url COLLATE pg_catalog."default");

-- Triggers

-- DROP TRIGGER IF EXISTS update_timestamp
--     ON services;

CREATE TRIGGER IF NOT EXISTS update_timestamp
    BEFORE UPDATE
    ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Table: users

-- DROP TABLE users;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes

-- DROP INDEX IF EXISTS idx_users_username;

CREATE INDEX IF NOT EXISTS idx_users_username
    ON users USING btree
    (username COLLATE pg_catalog."default");

-- Triggers

-- DROP TRIGGER IF EXISTS update_timestamp
--     ON users;

CREATE TRIGGER IF NOT EXISTS update_timestamp
    BEFORE UPDATE
    ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
