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
    u."id" AS "user_id",
    u."name",
    u."firstname",
    u."pseudo",
    u."email",
    u."description",
    u."availability",
    (
      SELECT jsonb_agg(jsonb_build_object(
        'id', p."id",
        'title', p."title",
        'description', p."description",
        'availability', p."availability"
      ))
      FROM (
        SELECT DISTINCT pr."id", pr."title", pr."description", pr."availability"
        FROM "project" pr
        INNER JOIN "project_has_user" pu ON pr."id" = pu."project_id"
        WHERE pu."user_id" = u."id"
        AND pu."id" IS NOT NULL
      ) AS p
    ) AS "projects",
    (
      SELECT jsonb_agg(jsonb_build_object(
        'id', t."id", 
        'name', t."name"
      ))
      FROM (
        SELECT DISTINCT ta."id", ta."name"
        FROM "tag" ta
        INNER JOIN "user_has_tag" ut ON ta."id" = ut."tag_id"
        WHERE ut."user_id" = u."id"
        AND ta."id" IS NOT NULL
      ) AS t
    ) AS "tags"
  FROM "user" u
  WHERE u."id" = id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;


COMMIT;
