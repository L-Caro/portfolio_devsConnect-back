-- Revert devsconnect:find_all_users from pg

BEGIN;

DROP FUNCTION find_all_users();

COMMIT;
