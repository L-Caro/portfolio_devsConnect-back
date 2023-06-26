-- Revert devsconnect:find_user_by_id from pg

BEGIN;

DROP FUNCTION find_user_by_id(id INT);

COMMIT;
