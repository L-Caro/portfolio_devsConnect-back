-- SQLBook: Code
-- Deploy devsconnect:JWT to pg

BEGIN;

ALTER TABLE "user"
ADD COLUMN "refresh_token" TEXT;

COMMIT;
