-- Migration number: 0001
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
