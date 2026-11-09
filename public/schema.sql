-- Hermes×Pi evidence ledger, schema version 1. Apply before ledger-data.sql.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS practices (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, domain TEXT NOT NULL,
 state TEXT NOT NULL CHECK(state IN ('pending','active','closed')),
 minutes INTEGER NOT NULL CHECK(minutes>0), week TEXT NOT NULL,
 goal TEXT NOT NULL, facts TEXT NOT NULL DEFAULT '', hypotheses TEXT NOT NULL DEFAULT '',
 steps TEXT NOT NULL DEFAULT '', method TEXT NOT NULL, benefit TEXT NOT NULL DEFAULT '',
 limitations TEXT NOT NULL DEFAULT '', next_action TEXT NOT NULL,
 decision TEXT NOT NULL CHECK(decision IN ('pending','continue','pause','stop')),
 code_ref TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS verification_records (
 id TEXT PRIMARY KEY, practice_id TEXT NOT NULL REFERENCES practices(id),
 task_id TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('ok','failed','timeout','invalid_output')),
 level TEXT NOT NULL CHECK(level IN ('simulation','local','real')),
 exit_code INTEGER, elapsed_ms INTEGER NOT NULL CHECK(elapsed_ms>=0),
 result TEXT NOT NULL DEFAULT '', error TEXT NOT NULL DEFAULT '', input TEXT NOT NULL,
 output TEXT NOT NULL, evidence TEXT NOT NULL, reproduce TEXT NOT NULL,
 fix TEXT NOT NULL DEFAULT '', next_action TEXT NOT NULL, real_confirmed INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL,
 CHECK(status!='ok' OR (exit_code IS NOT NULL AND exit_code=0 AND length(trim(result))>0 AND error='')),
 CHECK(status='ok' OR length(trim(error))>0),
 CHECK(status!='failed' OR (exit_code IS NOT NULL AND exit_code!=0)),
 CHECK(status!='timeout' OR exit_code IS NULL),
 CHECK(level!='real' OR real_confirmed=1)
);
CREATE INDEX IF NOT EXISTS records_by_practice ON verification_records(practice_id,created_at);
CREATE TABLE IF NOT EXISTS practice_versions (
 id TEXT PRIMARY KEY, practice_id TEXT NOT NULL REFERENCES practices(id),
 snapshot TEXT NOT NULL, created_at TEXT NOT NULL
);
