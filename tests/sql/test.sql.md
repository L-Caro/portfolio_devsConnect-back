
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

## Jointures

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

find_user_by_id
```sql
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
      ) AS project
    ) AS projects,
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

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$ LANGUAGE plpgsql;
```

Test

```sql
SELECT * FROM find_user_by_id(80);
```

La fonction SQL `find_user_by_id` prend un identifiant `id` en entrée et retourne une table avec les colonnes correspondant aux informations de l'utilisateur, y compris les projets et les tags associés. **Les résultats sont renvoyés sous la forme de colonnes** nommées `user_id`, `name`, `firstname`, `pseudo`, `email`, `description`, `availability`, `projects` (au format JSONB) et `tags` (également au format JSONB).

## JSONB

JSONB est un type de données dans PostgreSQL qui permet de stocker des données au format JSON (JavaScript Object Notation) de manière efficace. JSONB est une abréviation de "JSON Binary" ou "JSONB" pour faire la distinction avec le type de données JSON classique.

Le type JSONB **stocke des données JSON sous une forme binaire**, ce qui offre plusieurs avantages par rapport au type JSON :

- **Stockage compact** : Les données JSONB sont stockées de manière binaire, ce qui permet une compression efficace des données et une occupation réduite de l'espace de stockage.

- **Indexation** : PostgreSQL prend en charge l'indexation des colonnes de type JSONB, ce qui permet d'effectuer des recherches rapides et efficaces sur les données JSON.

- **Requêtes et opérations** : Les données JSONB peuvent être requêtées et manipulées directement à l'aide d'opérateurs et de fonctions SQL dédiés pour les types JSONB. PostgreSQL offre une large gamme de fonctions pour travailler avec les données JSONB, y compris l'extraction de valeurs, l'agrégation, la recherche textuelle, la mise à jour, etc.

- **Validation des données** : PostgreSQL vérifie la syntaxe JSON lors de l'insertion ou de la mise à jour des données JSONB, ce qui garantit que seules des données JSON valides sont stockées.

En résumé, JSONB est un type de données dans PostgreSQL qui permet de **stocker, indexer et manipuler efficacement des données au format JSON**. Il offre des fonctionnalités avancées pour travailler avec des données JSON dans une base de données relationnelle.

Dans la fonction `find_user_by_id`, la colonne `projects` et la colonne `tags` sont définies comme des types JSONB. Voici quelques raisons pour lesquelles JSONB est utilisé dans cette fonction :

- **Structure flexible** : Les données JSON sont souvent utilisées lorsque la structure des données peut varier d'un enregistrement à un autre. Dans ce cas, les projets et les tags associés à un utilisateur peuvent avoir des structures différentes. Le type JSONB permet de stocker ces données avec une flexibilité de structure, ce qui facilite l'ajout ou la suppression de propriétés selon les besoins.

- **Agrégation de données** : Le type JSONB offre des fonctions d'agrégation puissantes pour travailler avec des données JSON. Dans cette fonction, les projets et les tags associés à un utilisateur sont agrégés en utilisant les fonctions jsonb_agg et jsonb_build_object. Cela permet de regrouper les données liées à un utilisateur dans un format JSONB facilement exploitable.

- **Stockage efficace** : Le type JSONB stocke les données JSON de manière binaire, ce qui permet une compression efficace des données et une occupation réduite de l'espace de stockage. Cela peut être avantageux lorsque les données JSON sont volumineuses ou lorsque de nombreuses relations existent entre les utilisateurs, les projets et les tags.

- **Requêtes flexibles** : L'utilisation de JSONB permet d'effectuer des requêtes flexibles sur les données JSON. Par exemple, il est possible de filtrer les utilisateurs en fonction de certains tags spécifiques ou de rechercher des projets ayant certaines propriétés. Les opérateurs et les fonctions dédiés aux types JSONB offerts par PostgreSQL facilitent ces opérations.

En résumé, l'utilisation de JSONB dans cette fonction permet de stocker et de manipuler des données flexibles de manière efficace, en offrant des fonctionnalités avancées pour l'agrégation, la recherche et la manipulation de données JSON associées aux utilisateurs. Cela offre une plus grande souplesse et une plus grande facilité d'utilisation dans le traitement des données complexes liées aux projets et aux tags.
