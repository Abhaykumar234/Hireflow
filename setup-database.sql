-- HireFlow PostgreSQL Database Setup Script
-- Run this script as postgres user: psql -U postgres -f setup-database.sql

-- Create the database
CREATE DATABASE hireflow;

-- Create a dedicated user
CREATE USER hireflow_user WITH ENCRYPTED PASSWORD 'HireFlow2026!Secure';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE hireflow TO hireflow_user;

-- Connect to the hireflow database
\c hireflow

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO hireflow_user;

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hireflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hireflow_user;

-- Create tables
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    requirements TEXT,
    salary_range VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recruiter_id BIGINT,
    FOREIGN KEY (recruiter_id) REFERENCES users(id)
);

CREATE TABLE application (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    resume_url VARCHAR(500),
    cover_letter TEXT,
    stage VARCHAR(50) NOT NULL,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES job(id),
    FOREIGN KEY (candidate_id) REFERENCES users(id)
);

CREATE TABLE notification (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_job_recruiter ON job(recruiter_id);
CREATE INDEX idx_application_job ON application(job_id);
CREATE INDEX idx_application_candidate ON application(candidate_id);
CREATE INDEX idx_notification_user ON notification(user_id);

-- Display success message
\echo 'Database setup complete!'
\echo 'Tables created:'
\dt

\echo ''
\echo 'Next steps:'
\echo '1. Update application-prod.properties with password: HireFlow2026!Secure'
\echo '2. Set profile: $env:SPRING_PROFILES_ACTIVE = "prod"'
\echo '3. Run backend: .\mvnw.cmd spring-boot:run'
