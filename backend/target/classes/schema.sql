CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(255) PRIMARY KEY,
    config_value VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS academic_year (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    year_value VARCHAR(50) NOT NULL,
    is_current BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_account (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS project_group (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    academic_year_id BIGINT,
    primary_teacher_id BIGINT,
    secondary_teacher_id BIGINT
);

CREATE TABLE IF NOT EXISTS student_profile (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    academic_year_id BIGINT NOT NULL,
    group_id BIGINT
);

CREATE TABLE IF NOT EXISTS teacher_profile (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    academic_year_id BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_idea (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    group_id BIGINT NOT NULL,
    submitted_by_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS project_comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_idea_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS weekly_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    week_number INT NOT NULL,
    summary TEXT,
    links TEXT,
    submitted_at TIMESTAMP NOT NULL,
    primary_teacher_score DOUBLE,
    secondary_teacher_score DOUBLE
);

CREATE TABLE IF NOT EXISTS teacher_review (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    academic_year_id BIGINT NOT NULL,
    rating INT NOT NULL,
    feedback_text TEXT
);
