-- MyAIcademy Curriculum Engine Database Schema
-- SQLite compatible

-- Providers table
CREATE TABLE IF NOT EXISTS providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('llm', 'research', 'image', 'video', 'audio', 'data', 'automation', 'nocode')),
    website_url TEXT,
    changelog_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    provider_id TEXT,
    provider_name TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    video_url TEXT,
    caption_url TEXT,
    objective TEXT,
    key_topics TEXT, -- JSON array stored as text
    slides_url TEXT,
    practice_assessment TEXT, -- JSON object stored as text
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    track TEXT NOT NULL CHECK (track IN ('high_school', 'college', 'early_career', 'creative', 'entrepreneur', 'everyone')),
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    lesson_ids TEXT, -- JSON array stored as text
    lesson_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Course-Lesson junction table
CREATE TABLE IF NOT EXISTS course_lessons (
    course_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (course_id, lesson_id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- Mapping rules table (versioned)
CREATE TABLE IF NOT EXISTS mapping_rules (
    id TEXT PRIMARY KEY,
    version INTEGER NOT NULL DEFAULT 1,
    question_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    answer_value TEXT NOT NULL,
    recommended_course TEXT,
    recommended_track TEXT,
    priority INTEGER DEFAULT 5,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by TEXT
);

-- Updates from providers
CREATE TABLE IF NOT EXISTS updates (
    id TEXT PRIMARY KEY,
    provider_id TEXT,
    provider TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    published_at TEXT,
    source_url TEXT NOT NULL UNIQUE,
    raw_text TEXT,
    doc_urls TEXT, -- JSON array of {label, url} objects
    fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
    processed INTEGER DEFAULT 0,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Impact reports
CREATE TABLE IF NOT EXISTS impact_reports (
    id TEXT PRIMARY KEY,
    update_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    recommended_action TEXT NOT NULL CHECK (recommended_action IN ('update_lesson', 'create_lesson', 'update_mapping', 'no_action')),
    affected_lessons TEXT, -- JSON array
    mapping_suggestions TEXT, -- JSON array
    rationale TEXT NOT NULL,
    citations TEXT, -- JSON array
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'approved', 'rejected', 'assigned', 'done')),
    assignee TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    reviewed_by TEXT,
    reviewed_at TEXT,
    FOREIGN KEY (update_id) REFERENCES updates(id)
);

-- Audit logs (append-only)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    actor TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lessons_provider ON lessons(provider_id);
CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons(level);
CREATE INDEX IF NOT EXISTS idx_courses_track ON courses(track);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_mapping_rules_question ON mapping_rules(question_id);
CREATE INDEX IF NOT EXISTS idx_mapping_rules_active ON mapping_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_updates_provider ON updates(provider);
CREATE INDEX IF NOT EXISTS idx_updates_processed ON updates(processed);
CREATE INDEX IF NOT EXISTS idx_impact_reports_status ON impact_reports(status);
CREATE INDEX IF NOT EXISTS idx_impact_reports_provider ON impact_reports(provider);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
