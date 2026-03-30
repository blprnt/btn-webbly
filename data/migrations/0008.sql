-- Schema v9: per-project autocomplete profile

ALTER TABLE project_settings ADD COLUMN completion_profile TEXT NOT NULL DEFAULT 'auto';

PRAGMA user_version = 9;
