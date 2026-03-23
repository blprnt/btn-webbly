-- Schema v8

CREATE TABLE IF NOT EXISTS course_examples (
  project_id INTEGER NOT NULL PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

PRAGMA user_version = 8;
