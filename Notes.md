## Jointures tous les projets

- les tag
- les membres

Recupere tous les champs de project, crée un tableau format json d'objets, crée un objet avec le format 'titre champs', valeur ; inner join tout basé sur les id puis regroupe par id de projet
Afficher tous les projets groupés par id, avec leurs tags et les participants

SELECT "project"."title", "project"."id",
json_agg(json_build_object('tag_id', "tag"."id", 'tag_name', "tag"."name")) AS "tags",
json_agg(json_build_object('user_id', "user"."id", 'user_name', "user"."name")) AS "users"
FROM "project"
INNER JOIN "project_has_tag" ON "project"."id" = "project_has_tag"."project_id"
INNER JOIN "tag" ON "project_has_tag"."tag_id" = "tag"."id"
INNER JOIN "project_has_user" ON "project"."id" = "project_has_user"."project_id"
INNER JOIN "user" ON "project_has_user"."user_id" = "user"."id"
GROUP BY "project"."id";

SELECT project.id, project.title,
json_agg(json_build_object('tag_id', tag.id, 'tag_name', tag.name)) AS tags
FROM project
INNER JOIN project_has_tag ON project.id = project_has_tag.project_id
INNER JOIN tag ON project_has_tag.tag_id = tag.id
GROUP BY project.id, project.title;

https://www.postgresql.org/docs/9.5/functions-json.html

*Afficher le nom de la plantation et le libellé des rangées concrnées (une ligne par rangée)*
*Grouper par plantation et ne présenter qu'une ligne par plantation avec ``ARRAY_AGG``*

```SQL
SELECT DISTINCT 
    "field"."name", 
    ARRAY_AGG ("row"."label" ORDER BY "species"."common_name" ASC)
FROM "species"
    JOIN "variety"
        ON "variety"."species_id" = "species"."id"
     JOIN "row"
        ON "row"."variety_id" = "variety"."id"
    JOIN "field"
        ON "row"."field_id" = "field"."id"
WHERE "variety"."bitterness" = 5
GROUP BY 
    "field"."name";
```


## Fausse route authentification du front

```js
async postUsers(req, res) {
    // Récupérer les données envoyées dans le corps de la requête
    const { email, password } = req.body;

    // Vérifier les informations d'identification
    const user = await dataMapper.findUserByEmail(email);

    if (user && user.password === password) {
      // Connexion réussie
      console.log("Connexion réussie");
      res.json({
        success: true,
        message: "Connexion réussie",
        pseudo: user.pseudo,
        logged: true,
      });
    } else {
      console.log("Identifiants invalides");
      // Identifiants invalides
      res.json({
        success: false,
        message: "Identifiants invalides",
        logged: false,
      });
    }
  },
```

## ON DELETE CASCADE

FOREIGN KEY (ClientID)
        REFERENCES Clients (ClientID)
        ON DELETE CASCADE

A foreign key with cascade delete means that if a record in the parent table is deleted, then the corresponding records in the child table will automatically be deleted. This is called a cascade delete in SQL Server.

DELETE CASCADE: When we create a foreign key using this option, it deletes the referencing rows in the child table when the referenced row is deleted in the parent table which has a primary key.

## Architecture

`index.js` à la racine : fichier d'init de l'API
dossier app :
    - `index.js` à la racine : config de base du dossier app --> dispatche dans les différents éléments
    - routers : `index.js` regroupe la config de tous les routers pour dispatcher à chaque router
    - controllers : `projectController` --> récupérer tous les projets
    - dataMappers : `database.js` --> client (pool)
