
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

## Sous-requêtes

```js
SELECT "pseudo" FROM "user" WHERE "id" (
  SELECT "id" FROM "user_has_tag" WHERE "tag_id" (
    SELECT "id" FROM "tag" WHERE "id" = 20
  )
)
```

--> doit renvoyer les pseudos des utilisateurs qui ont une relation avec le tag ayant l'ID 20
En renvoie 9 mais il y en a 33 dans la table user_has_tag
--> en renvoie 28 avec les id

## Fonction SQL 

`find_user_by_id`

```sql
CREATE OR REPLACE FUNCTION find_user_by_id(id INT) -- paramètre typé
  RETURNS TABLE ( -- valeurs retournées
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
AS $$ -- instruction de fonction
BEGIN
  RETURN QUERY 
  -- les éléments individuels à renvoyer sont spécifiés
  -- RETURN QUERY ajoute les résultats de la requête à l'ensemble du résultat de la fonction
  -- ne s'utilise qu'avec le langage plpgsql
  SELECT
    "user"."id" AS "user_id",
    "user"."name",
    "user"."firstname",
    "user"."pseudo",
    "user"."email",
    "user"."description",
    "user"."availability",
    (
      SELECT jsonb_agg(jsonb_build_object(
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
      ) AS "project"
    ) AS "projects",
    (
      SELECT jsonb_agg(jsonb_build_object(
        'id', "tag"."id", 
        'name', "tag"."name"
      ))
      FROM (
        SELECT DISTINCT "tag"."id", "tag"."name"
        FROM "tag"
        INNER JOIN "user_has_tag" ON "tag"."id" = "user_has_tag"."tag_id"
        WHERE "user_has_tag"."user_id" = "user"."id"
      ) AS "tag"
    ) AS "tags"
  FROM "user"
  WHERE "user"."id" = "id";

  IF NOT FOUND THEN -- Gestion de l'erreur
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$ LANGUAGE plpgsql STABLE; -- définir le type de langage
-- STABLE : mise en cache des résultats
```

Test

```sql
SELECT * FROM find_user_by_id(80);
```

**Erreur :**
{
  "status": "error",
  "statusCode": 500,
  "message": "column reference \"id\" is ambiguous"
}

## JSONB

L'utilisation de JSONB permet de **stocker, indexer et manipuler efficacement des données au format JSON** : fonctionnalités avancées pour l'agrégation, la recherche et la manipulation de données JSON associées aux utilisateurs
--> offre une plus grande souplesse et une plus grande facilité d'utilisation dans le traitement des données complexes liées aux projets et aux tags
