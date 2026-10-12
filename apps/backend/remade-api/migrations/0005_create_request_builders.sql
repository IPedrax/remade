CREATE TABLE request_builders (
    original TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (original, user_id)
);

CREATE INDEX idx_request_builders_user_id ON request_builders(user_id);
