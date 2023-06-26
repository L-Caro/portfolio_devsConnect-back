-- Deploy devsconnect:findUserById-function to pg

BEGIN;

CREATE OR REPLACE FUNCTION find_user_by_id(id INT)
  RETURNS TABLE (
    user_id INT,
    name VARCHAR(64),
    firstname VARCHAR(64),
    pseudo VARCHAR(64),
    email VARCHAR(64),
    description TEXT,
    availability BOOLEAN,
    projects JSONB,
    tags JSONB 
  )
AS $$
BEGIN
  RETURN QUERY
  SELECT
    "user"."id" AS "user_id",
    "user"."name",
    "user"."firstname",
    "user"."pseudo",
    "user"."email",
    "user"."description",
    "user"."availability",
     (
      SELECT json_agg(json_build_object(
        'id', "project"."id",
        'title', "project"."title",
        'description', "project"."description",
        'availability', "project"."availability"
      ))
      FROM (
        SELECT DISTINCT "project"."id", "project"."title", "project"."description", "project"."availability"
        FROM "project"
        INNER JOIN "project_has_user" ON "project"."id" = "project_has_user"."project_id"
        WHERE "project_has_user"."user_id" = "user"."id"
        AND "project_has_user"."id" IS NOT NULL
      ) AS "project"
    ) AS "projects",
    (
      SELECT json_agg(json_build_object(
        'id', "tag"."id", 
        'name', "tag"."name"
      ))
      FROM (
        SELECT DISTINCT "tag"."id", "tag"."name"
        FROM "tag"
        INNER JOIN "user_has_tag" ON "tag"."id" = "user_has_tag"."tag_id"
        WHERE "user_has_tag"."user_id" = "user"."id"
        AND "tag"."id" IS NOT NULL
      ) AS "tag"
    ) AS "tags"
  FROM "user"
  WHERE "user"."id" = "user_id";

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;


COMMIT;
