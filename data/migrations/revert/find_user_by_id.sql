-- Revert devsconnect:findUserById-function from pg

BEGIN;

DROP FUNCTION find_user_by_id(INT);

COMMIT;
