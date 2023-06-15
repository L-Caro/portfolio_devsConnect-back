-- Verify devsconnect:JWT on pg

BEGIN;


SELECT "refresh_token" FROM "user" WHERE false;

ROLLBACK;
