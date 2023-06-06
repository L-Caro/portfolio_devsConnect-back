-- SQLBook: Code
-- Revert devsconnect:init from pg

BEGIN;

DROP TABLE IF EXISTS "user", "project", "tag", "project_has_tag", "user_has_tag", "project_has_user";

COMMIT;
