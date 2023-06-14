
## Requête findAllProjects

Avant 

```sql
SELECT
      "project"."id",
      "project"."title",
      "project"."description",
      "project"."availability",
      (
        SELECT json_agg(json_build_object('tag_id', "tag"."id", 'tag_name', "tag"."name"))
        FROM (
          SELECT DISTINCT "tag"."id", "tag"."name"
          FROM "project_has_tag"
          INNER JOIN "tag" ON "project"."id" = "project_has_tag"."project_id"
          WHERE "project_has_tag"."project_id" = "project"."id"
          ORDER BY "tag"."id"
        ) AS "tag"
      ) AS tags,
      (
        SELECT json_agg(json_build_object('user_id', "user"."id", 'user_name', "user"."name"))
        FROM (
          SELECT DISTINCT "user"."id", "user"."name"
          FROM "project_has_user"
          INNER JOIN "user" ON "project"."id" = "project_has_user"."project_id"
          WHERE "project_has_user"."project_id" = "project"."id"
          ORDER BY "user"."id"
        )AS "user"
      ) AS users
    FROM
      "project"
    GROUP BY
      "project"."id";
```

Après

```sql
SELECT
    "project"."id",
    "project"."title",
    "project"."description",
    "project"."availability",
    json_agg(json_build_object('tag_id', "tag"."id", 'tag_name', "tag"."name")) AS tags,
    json_agg(json_build_object('user_id', "user"."id", 'user_name', "user"."name")) AS users
FROM
    "project"
LEFT JOIN
    "project_has_tag" ON "project"."id" = "project_has_tag"."project_id"
LEFT JOIN
    "tag" ON "project_has_tag"."tag_id" = "tag"."id"
LEFT JOIN
    "project_has_user" ON "project"."id" = "project_has_user"."project_id"
LEFT JOIN
    "user" ON "project_has_user"."user_id" = "user"."id"
GROUP BY
    "project"."id";
```

Jointures LEFT JOIN pour récupérer les tags et les utilisateurs associés à chaque projet --> évite d'utiliser des sous-requêtes distinctes pour chaque agrégation.

Clauses DISTINCT et ORDER BY déplacées dans les sous-requêtes des jointures LEFT JOIN pour s'assurer que les résultats des tags et des utilisateurs soient uniques et ordonnés correctement.

Fonction d'agrégation json_agg pour regrouper les tags et les utilisateurs associés à chaque projet en un seul tableau JSON.

Suppression de la condition WHERE "project_has_tag"."project_id" = "project"."id" et la condition WHERE "project_has_user"."project_id" = "project"."id" car les jointures LEFT JOIN suffisent pour filtrer les données correctement.

## Requête findOneProject

Avant

```sql
SELECT
      "project"."id",
      "project"."title",
      "project"."description",
      (
          SELECT json_agg(json_build_object('tag_id', "tag"."id", 'tag_name', "tag"."name"))
          FROM (
              SELECT DISTINCT "tag"."id", "tag"."name"
              FROM "project_has_tag"
              INNER JOIN "tag" ON "project"."id" = "project_has_tag"."project_id"
              WHERE "project_has_tag"."project_id" = "project"."id"
              ORDER BY "tag"."id"
              ) AS "tag"
      ) AS tags,
      (
          SELECT json_agg(json_build_object('user_id', "user"."id", 'user_name', "user"."name"))
          FROM (
              SELECT DISTINCT "user"."id", "user"."name"
              FROM "project_has_user"
              INNER JOIN "user" ON "project"."id" = "project_has_user"."project_id"
              WHERE "project_has_user"."project_id" = "project"."id"
              ORDER BY "user"."id"
              )AS "user"
      ) AS users
  FROM
      "project"
  WHERE
      "id" = $1
  GROUP BY
      "project"."id";
```

Après :

```sql
SELECT
    "project"."id",
    "project"."title",
    "project"."description",
    (
        SELECT json_agg(json_build_object('tag_id', "tag"."id", 'tag_name', "tag"."name"))
        FROM (
            SELECT DISTINCT ON ("tag"."id") "tag"."id", "tag"."name"
            FROM "project_has_tag"
            INNER JOIN "tag" ON "project_has_tag"."tag_id" = "tag"."id"
            WHERE "project_has_tag"."project_id" = "project"."id"
            ORDER BY "tag"."id"
        ) AS "tag"
    ) AS tags,
    (
        SELECT json_agg(json_build_object('user_id', "user"."id", 'user_name', "user"."name"))
        FROM (
            SELECT DISTINCT ON ("user"."id") "user"."id", "user"."name"
            FROM "project_has_user"
            INNER JOIN "user" ON "project_has_user"."user_id" = "user"."id"
            WHERE "project_has_user"."project_id" = "project"."id"
            ORDER BY "user"."id"
        ) AS "user"
    ) AS users
FROM
    "project"
WHERE
    "project"."id" = $1;
```

DISTINCT ON pour éviter la nécessité d'utiliser un sous-requête supplémentaire pour l'agrégation des tags et des utilisateurs. La clause DISTINCT ON permet de sélectionner uniquement une seule occurrence distincte pour chaque identifiant de tag ou d'utilisateur.

Conditions de jointure modifiées pour utiliser directement les colonnes de liaison des tables "project_has_tag" et "project_has_user" plutôt que de les lier via la table "project".

Suppression de la clause GROUP BY puisqu'elle n'est plus nécessaire avec l'utilisation de la clause DISTINCT ON dans les sous-requêtes.

## Requête removeOneProject

```sql
WITH deleted_tags AS (
    DELETE FROM "project_has_tag"
    WHERE "project_id" = $1
    RETURNING *
),
deleted_users AS (
    DELETE FROM "project_has_user"
    WHERE "project_id" = $1
    RETURNING *
),
deleted_project AS (
    DELETE FROM "project"
    WHERE "id" = $1
    RETURNING *
)
SELECT
    deleted_project.*,
    (
        SELECT json_agg(json_build_object('tag_id', "tag"."id", 'tag_name', "tag"."name"))
        FROM (
            SELECT DISTINCT "tag"."id", "tag"."name"
            FROM "tag"
            INNER JOIN deleted_tags ON "tag"."id" = deleted_tags."tag_id"
            ORDER BY "tag"."id"
        ) AS "tag"
    ) AS tags,
    (
        SELECT json_agg(json_build_object('user_id', "user"."id", 'user_name', "user"."name"))
        FROM (
            SELECT DISTINCT "user"."id", "user"."name"
            FROM "user"
            INNER JOIN deleted_users ON "user"."id" = deleted_users."user_id"
            ORDER BY "user"."id"
        ) AS "user"
    ) AS users
FROM deleted_project;
```
