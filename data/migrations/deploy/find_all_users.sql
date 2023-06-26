-- SQLBook: Code
-- Deploy devsconnect:find_all_users to pg

BEGIN;

DROP FUNCTION find_all_users();
CREATE OR REPLACE FUNCTION find_all_users()
  RETURNS TABLE (
    user_id INT,
    name VARCHAR(64),
    firstname VARCHAR(64),
    pseudo VARCHAR(64),
    email VARCHAR(64),
    description TEXT,
    availability BOOLEAN,
    projects JSON,
    tags JSON
  )
AS $$
BEGIN
  RETURN QUERY
  SELECT
    "user"."id" AS "user_id",
      "user"."name",
      "user"."firstname",
      "user"."pseudo",
      "user"."description",
      "user"."availability",
    (
        SELECT json_agg(json_build_object('id', "project"."id", 'title', "project"."title"))
        FROM (
          SELECT DISTINCT "project"."id", "project"."title"
          FROM "project"
          INNER JOIN "project_has_user" ON "project"."id" = "project_has_user"."project_id"
          WHERE "project_has_user"."user_id" = "user"."id"
        )AS "project"
      ) AS "projects",
      (
        SELECT json_agg(json_build_object('id', "tag"."id", 'name', "tag"."name"))
        FROM (
          SELECT DISTINCT "tag"."id", "tag"."name"
          FROM "tag"
          INNER JOIN "user_has_tag" ON "tag"."id" = "user_has_tag"."tag_id"
          WHERE "user_has_tag"."user_id" = "user"."id"
        ) AS "tag"
      ) AS "tags"
    FROM "user";

END;
$$ LANGUAGE plpgsql STABLE;

COMMIT;

