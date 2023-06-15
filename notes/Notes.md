# createOneUser with tags
--> nouvelles fonctions addTagsToUser, addTagsToProject et itérer les fonctions dans les create et update
## dataMapper

```js
async createOneUser(name, firstname, email, pseudo, password, description, availability, tags) {
  const preparedUserQuery = {
    text: `INSERT INTO "user" (name, firstname, email, pseudo, password, description, availability) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    values: [name, firstname, email, pseudo, password, description, availability],
  };

  const userResult = await client.query(preparedUserQuery);
  const user = userResult.rows[0];

  const addTagsToUser = tags.map(async (tagId) => {
    const tagId = tag.id;
    // Effectuer des opérations asynchrones : la requête à la base de données
    const preparedTagQuery = {
      text: `INSERT INTO "user_has_tag" ("user_id", "tag_id") VALUES ($1, $2) RETURNING *`,
      values: [user.id, tagId],
    };

    const tagResult = await client.query(preparedTagQuery);
    return tagResult.rows[0];
  });

// Attendre que toutes les opérations asynchrones se terminent
  await Promise.all(addTagsToUser);

  return user; // Tableau des résultats des opérations asynchrones
}
```

## controller

```js
async addOneUser(req, res) {
      const { name, firstname, email, pseudo, password, description, availability, tags } = req.body;
      const user = await dataMapper.createOneUser(name, firstname, email, pseudo, password, description, availability, tags);
      res.json({status: 'success', data: user })
    },
```

# updateOneProject : avant ajout tags et users
```js
async updateOneProject (projectId, updatedFields) {
    const {title, description, availability, user_id, tags, users} = updatedFields;
    const preparedQuery= {
       text: `UPDATE "project" 
          SET title = COALESCE($1, title), 
          description = COALESCE($2, description), 
          availability = COALESCE($3, availability), 
          user_id = COALESCE($4, user_id), 
          updated_at = NOW() 
       WHERE id=$5 RETURNING *`,
       values: [title, description, availability, user_id, projectId]
    }
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Project not found', { statusCode: 204 });
    }
    return results.rows[0]; 
  },
```

Avec tags et users mais erreur de syntaxe INSERT
```js
  async updateOneProject(projectId, updatedFields) {
    const { title, description, availability, user_id, tags, users } = updatedFields;
    const preparedQuery = {
      text: `UPDATE "project"
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 availability = COALESCE($3, availability),
                 user_id = COALESCE($4, user_id),
                 updated_at = NOW()
             WHERE id = $5
             RETURNING *`,
      values: [title, description, availability, user_id, projectId]
    };
  
    if (tags) {
      preparedQuery.text += `; DELETE FROM "project_has_tag" WHERE project_id = $5;`; // += permet de concaténer les requêtes
      for (const tag of tags) {
        preparedQuery.text += ` INSERT INTO "project_has_tag" (project_id, tag_id) VALUES ($${preparedQuery.values.length + 1})`;
        // $$ permet de délimiter une variable dans une requête
        // $5 correspond à l'id du projet, $6 correspond à l'id du premier tag, $7 au deuxième, etc.
        preparedQuery.values.push(tag);
        // On ajoute l'id du tag dans le tableau des valeurs
      }
    }
  
    if (users) {
      preparedQuery.text += `; DELETE FROM "project_has_user" WHERE project_id = $5;`;
      for (const user of users) {
        preparedQuery.text += ` INSERT INTO "project_has_user" (project_id, user_id) VALUES ($${preparedQuery.values.length + 1})`;
        preparedQuery.values.push(user);
      }
    }
  
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Project not found', { statusCode: 204 });
    }
    return results.rows[0]; 
  },
```
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
