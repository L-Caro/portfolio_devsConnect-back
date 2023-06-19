```js

// PROJECTS

// methode listee en arrow pour tester different coding style avec requetes sql pour tous les projets
const findAllProjects = async () => { //OK
  const results = await client.query(`
  SELECT
    "project"."id",
    "project"."title",
    "project"."description",
    "project"."availability",
    "project"."user_id",
    (
      SELECT json_agg(json_build_object('id', "tag"."id", 'name', "tag"."name"))
      FROM (
        SELECT DISTINCT "tag"."id", "tag"."name"
        FROM "tag"
        INNER JOIN "project_has_tag" ON "tag"."id" = "project_has_tag"."tag_id"
        WHERE "project_has_tag"."project_id" = "project"."id"
      ) AS "tag"
    ) AS "tags",
    (
      SELECT json_agg(json_build_object('id', "user"."id", 'pseudo', "user"."pseudo", 'is_active', "user"."is_active"))
      FROM (
        SELECT DISTINCT "user"."id", "user"."pseudo", "project_has_user"."is_active"
        FROM "user"
        INNER JOIN "project_has_user" ON "user"."id" = "project_has_user"."user_id"
        WHERE "project_has_user"."project_id" = "project"."id"
      )AS "user"
    ) AS "users"
  FROM "project"
  GROUP BY
    "project"."id";
  `);
  return results.rows; 
}

//methode pour recuperer un seul projet a partir de l'id recu en parametre
const findOneProject = async (id) => { //OK
  const preparedQuery = {
    text: `SELECT
    "project"."id",
    "project"."title",
    "project"."description",
    "project"."availability",
    "project"."user_id",
    (  
        SELECT "user"."pseudo"
        FROM "user"
        WHERE "user"."id" = "project"."user_id"
    ) AS user_pseudo,
    (
        SELECT json_agg(json_build_object('tag_id', "tag"."id", 'tag_name', "tag"."name"))
        FROM (
            SELECT DISTINCT ON ("tag"."id") "tag"."id", "tag"."name"
            FROM "tag"
            INNER JOIN "project_has_tag" ON "project_has_tag"."tag_id" = "tag"."id"
            WHERE "project_has_tag"."project_id" = "project"."id"
            ORDER BY "tag"."id"
        ) AS "tag"
    ) AS "tags",
    (
        SELECT json_agg(json_build_object('user_id', "user"."id", 'pseudo', "user"."pseudo", 'is_active', "user"."is_active"))
        FROM (
            SELECT DISTINCT ON ("user"."id") "user"."id", "user"."pseudo", "project_has_user"."is_active"
            FROM "user"
            INNER JOIN "project_has_user" ON "project_has_user"."user_id" = "user"."id"
            WHERE "project_has_user"."project_id" = "project"."id"
            ORDER BY "user"."id"
        ) AS "user"
    ) AS "users"
FROM
    "project"
WHERE
    "project"."id" = $1;`,
    values: [id],
  };
  const results = await client.query(preparedQuery);
  if (!results.rows[0]) {
    throw new ApiError('Project not found', { statusCode: 204 });
  }
  return results.rows[0]; 
}

const removeOneProject = async(id) => { //OK
  const preparedQuery = {
    text: `DELETE FROM "project" WHERE "id" = $1 RETURNING *`,
    values: [id],
  };
  const results = await client.query(preparedQuery);
  if (!results.rows[0]) {
    throw new ApiError('Project already deleted', { statusCode: 204 });
  }
  return results.rows[0];
}

const createOneProject = async(title, description, availability, user_id, tags) => { //OK
  console.log(user_id);
  const preparedProjectQuery= {
     text: `INSERT INTO "project" ("title", "description", "availability", "user_id") VALUES ($1, $2, $3, $4) RETURNING *`,
     values: [title, description, availability, user_id]
  }
  const projectResults = await client.query(preparedProjectQuery);
  const project = await projectResults.rows[0];
  
  if (tags){
  const addTagsToProject = tags.map(async (tagId) => {
    const preparedTagQuery = {
        text: `INSERT INTO "project_has_tag" ("project_id", "tag_id") VALUES ($1, $2) RETURNING *`,
        values: [project.id, tagId],
      };
  
  const tagResults = await client.query(preparedTagQuery);
  return tagResults.rows[0];
  });

  await Promise.all(addTagsToProject);
  };

// TODO il faut ajouter une relation project_has_user

  return project;
}

/* Je veux mettre à jour les champs title, description, availability, 
  avec les tags qui lui sont associés, ayant une relation project/tag dans la table project_has_tag
  et les users qui lui sont associés, ayant une relation project/user dans la table project_has_user
  et je veux que ça me renvoie le projet avec les tags et les users mis à jour */
 
  // TODO : fonctionne mais refacto les fonctions if

  const updateOneProject = async (projectId, projectUpdate) => {  //projectUpdate = {title, description, availability, tags}
    // Récupérer le projet actuel avec les tags
    const currentProject = await findOneProject(projectId);
    if (!currentProject) {
      throw new ApiError('Project not found', { statusCode: 204 });
    }
  
    // Supprimer les tags absents
    if (currentProject.tags) { 
      if (!projectUpdate.tags) { 
        projectUpdate.tags = [];
      };
      // le front envoie un tableau d'id de tags
      const tagsToDelete = currentProject.tags.filter(
        (tag) => !projectUpdate.tags.some((updatedTag) => updatedTag === tag.tag_id)
      );
      tagsToDelete.forEach(async tag => {
        await projectTagMapper.deleteProjectHasTag(projectId, tag.tag_id);
      });
    };
    
    // Ajouter les nouveaux tags
    if (projectUpdate.tags) { 
      if (!currentProject.tags) { 
        currentProject.tags = [];
      };
      // le front envoie un tableau d'id de tags
      const tagsToAdd = projectUpdate.tags.filter(
        (updatedTag) => !currentProject.tags.some((tag) => tag.tag_id === updatedTag)
      );
      tagsToAdd.forEach(async tag => {
        await projectTagMapper.createProjectHasTag(projectId, tag);
      });
    };
  
    // Mettre à jour les champs du projet
    const preparedQuery = {
      text: `UPDATE "project" 
        SET title = COALESCE($1, title), 
          description = COALESCE($2, description), 
          availability = COALESCE($3, availability),
          updated_at = NOW()
        WHERE id=$4 RETURNING *`,
      values: [projectUpdate.title, projectUpdate.description, projectUpdate.availability, projectId],
    };
  
    const results = await client.query(preparedQuery);
    const project = results.rows[0];
  
    return project;
  };

  const findProjectOwner = async(projectId) => {
    const preparedQuery = {
      text: `SELECT "project"."user_id" FROM "project"
             WHERE "project"."id" = $1`,
      values: [projectId],
    };
  
    const results = await client.query(preparedQuery);
    return results.rows[0].user_id;
  }

// USERS

const setRefreshToken = async(id, token) => {
  const preparedQuery = {
    text: 'UPDATE "user" set "refresh_token" = $2 WHERE "id" = $1 RETURNING *',
    values: [id, token],
  };
  const results = await client.query(preparedQuery);
  return results.rows;
}

const getRefreshToken = async(id) => {
// TODO : où est la fonction ? 
}

const findAllUsers = async () => { // OK
  const preparedQuery ={
    text: `SELECT
      "user"."id",
      "user"."name",
      "user"."firstname",
      "user"."pseudo",
      "user"."description",
      "user"."availability",
      "user"."created_at",
      "user"."updated_at",
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
      )AS "tags"
    FROM "user"`};
  const results = await client.query(preparedQuery);
  return results.rows; 
}

const findOneUser = async(id) => { // OK
  const preparedQuery = {
    text: `SELECT
    "user"."id",
    "user"."name",
    "user"."firstname",
    "user"."pseudo",
    "user"."email",
    "user"."description",
    "user"."availability",
    "user"."created_at",
    "user"."updated_at",
    (
      SELECT json_agg(json_build_object('id', "project"."id", 'title', "project"."title", 'description', "project"."description", 'availability', "project"."availability"))
      FROM (
        SELECT DISTINCT "project"."id", "project"."title", "project"."description", "project"."availability"
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
    )AS "tags"
  FROM "user"
  WHERE "id" = $1`,
    values: [id],
  };
  const results = await client.query(preparedQuery);
  if (!results.rows[0]) {
    throw new ApiError('User not found', { statusCode: 204 });
  }
  return results.rows[0]; 
}

const removeOneUser = async(id) => { //OK
  const preparedQuery = {
    text: `DELETE FROM "user" WHERE "id" = $1 RETURNING *`,
    values: [id],
  };
  const results = await client.query(preparedQuery);
  if (!results.rows[0]) {
    throw new ApiError('User already deleted', { statusCode: 204 });
  }
  return results.rows[0];
}

const createOneUser = async(name, firstname, email, pseudo, password, description, availability, tags) => { //OK
  const preparedUserQuery = {
    text: `INSERT INTO "user" ("name", "firstname", "email", "pseudo", "password", "description", "availability") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    values: [name, firstname, email, pseudo, password, description, availability],
  };

  const userResult = await client.query(preparedUserQuery);
  const user = userResult.rows[0];

  tags.forEach(async (tagId) => {
    const preparedTagQuery = {
      text: `INSERT INTO "user_has_tag" ("user_id", "tag_id") VALUES ($1, $2) RETURNING *`,
      values: [user.id, tagId],
    };

    const tagResult = await client.query(preparedTagQuery);
    return tagResult.rows[0];
  });

  return user; // Tableau des résultats des opérations asynchrones
}

/* Je veux mettre à jour les champs name, firstname, email, pseudo, password, description, availability,  
    avec les tags qui lui sont associés, ayant une relation user/tag dans la table user_has_tag
    et les users qui lui sont associés, ayant une relation project/user dans la table project_has_user
    et je veux que ça me renvoie le projet avec les tags et les users mis à jour */

const updateOneUser = async (userId, userUpdate) => { // OK
    const currentUser = await findOneUser(userId);
    if (!currentUser) {
      throw new ApiError('User not found', { statusCode: 204 });
    };
  
    if (userUpdate.tags) { 
      const currentUserTags = currentUser.tags;
    
      const tagsToDelete = currentUserTags.filter(
        (tag) => !userUpdate.tags.some((updatedTag) => updatedTag === tag.tag_id)
        // TODO : vérifier si ça bloque quand on n'entre pas de tag à mettre à jour
        // si userUpdate.tags est undefined --> userUpdate.tags && userUpdate.tags.some : la condition sera évaluée à false et plus undefined
      );
      const tagsToCreate = userUpdate.tags.filter(
        (tag) => !currentUserTags.some((existingTag) => existingTag.tag_id === tag)
      );
    
      await Promise.all([
        ...tagsToDelete.map((tag) => userTagMapper.deleteUserHasTag(userId, tag.id)),
        ...tagsToCreate.map((tag) => userTagMapper.createUserHasTag(userId, tag)),
      ]);
    };

// je veux vérifier si le statut is_active de la table project_has_user est le meme que celui du user reçu
// si il est different je veux le mettre à jour

  if (currentUser.projects) {  

    const projectsToUpdate = userUpdate.projects.filter((project) => {
      const currentProject = currentUser.projects.find(
        (existingProject) => existingProject.id === project.id
      );
      return project.is_active !== currentProject.is_active;
    });

    await Promise.all(
      projectsToUpdate.map((project) =>
        projectUserMapper.updateProjectHasUser(userId, project.id, project.is_active)
      )
    );
  };
//TODO voir en cas d'ajout ou suppression d'user concomitant a l'update
// actuellement, la length du tableau des users du projet doit être la même que celle du tableau des users modifiés

const preparedQuery = { //je mets à jour le projet
  text: `UPDATE "user"
  SET "name" = COALESCE($1, "name"), 
      "firstname" = COALESCE($2, "firstname"), 
      "email" = COALESCE($3, "email"), 
      "pseudo" = COALESCE($4, "pseudo"), 
      "password" = COALESCE($5, "password"), 
      "description" = COALESCE($6, "description"), 
      "availability" = COALESCE($7, "availability"),
      "updated_at"= NOW()
  WHERE "id"=$8 
  RETURNING "name", "firstname", "email", "pseudo", "description", "availability", "updated_at"`,
values: [
  userUpdate.name,
  userUpdate.firstname,
  userUpdate.email,
  userUpdate.pseudo,
  userUpdate.password,
  userUpdate.description,
  userUpdate.availability,
  userId,
],
};

const results = await client.query(preparedQuery);
const user = results.rows[0];

return user;
}

const findUserByEmail = async(email) => {
  const preparedQuery = {
    text: `SELECT * FROM "user"
           WHERE "email" = $1`,
    values: [email],
  };

  const results = await client.query(preparedQuery);
  return results.rows[0];
}

// TAGS

const findAllTags = async () => { // OK
  const preparedQuery = `SELECT * FROM "tag"`;
  const results = await client.query(preparedQuery);
  if (!results.rows) {
    throw new ApiError('Tags not found', { statusCode: 204 });
  }
  return results.rows; 
}

//methode pour recuperer un tag en fonction de l'id recue en parametre
const findOneTag = async(id) => { // OK
const preparedQuery = {
  text: `SELECT * FROM "tag" WHERE "id" = $1`,
  values: [id],
};
const results = await client.query(preparedQuery);
if (!results.rows[0]) {
  throw new ApiError('Tag not found', { statusCode: 204 });
}
return results.rows[0]; 
}

// USER HAS TAG

const createUserHasTag = async(userId, tagId) => {
  const preparedQuery = {
    text: `INSERT INTO "user_has_tag" ("user_id", "tag_id") VALUES ($1, $2) RETURNING *`,
    values: [userId, tagId],
  };
  const results = await client.query(preparedQuery);
  if (!results.rows[0]) {
    throw new ApiError('Relation not found', { statusCode: 204 });
  }
  return results.rows[0]; 
}

/* Je veux retirer un tag d'un user */

const deleteUserHasTag = async(userId, tagId) => {
  const preparedQuery = {
    text: `DELETE FROM "user_has_tag" WHERE "user_id" = $1 AND "tag_id" = $2 RETURNING *`,
    values: [userId, tagId],
  };
  const result = await client.query(preparedQuery);
  if (!result.rows[0]) {
    throw new ApiError('Relation not found', { statusCode: 204 });
  }
  return result.rows[0];
}

// PROJECT HAS USER

// l'user devient postulant à un projet 
// POST /api/users/:id/projects/:projectId

const createProjectHasUser = async(projectId, userId) => {
  const preparedQuery = {
    text: `INSERT INTO "project_has_user" ("project_id", "user_id") VALUES ($1, $2) RETURNING *`,
    values: [projectId, userId],
  };
  const results = await client.query(preparedQuery);
  if (!results.rows[0]) {
    throw new ApiError('Relation not found', { statusCode: 204 });
  }
  return results.rows[0]; 
}

// Je veux modifier le statut d'un postulant en is_active true : bouton Accepter  
// PUT /api/users/:id/projects/:projectId

const updateProjectHasUser = async(projectId, userId) => {
  const result = await client.query(`UPDATE "project_has_user" 
    SET "is_active" = NOT"is_active"
    WHERE "project_has_user"."project_id" = ${projectId} 
    AND "project_has_user"."user_id" = ${userId} 
    RETURNING *`
  );
  if (!result.rows[0]) {
    throw new ApiError('Relation not found', { statusCode: 204 });
  }
  return result.rows[0]; 
}

// Je refuse un user postulant à un project : bouton Refuser ou Me retirer  
// DELETE /api/users/:id/projects/:projectId

const deleteProjectHasUser = async(projectId, userId) => {
  const preparedQuery = {
    text: `DELETE FROM "project_has_user" ("project_id", "user_id") VALUES ($1, $2) RETURNING *`,
    values: [projectId, userId],
  };
  const result = await client.query(preparedQuery);
  if (!result.rows[0]) {
    throw new ApiError('Relation not found', { statusCode: 204 });
  }
  return result.rows[0];
}

// PROJECT HAS TAG

const createProjectHasTag = async(projectId, tagId) => {
  const preparedQuery = {
    text: `INSERT INTO "project_has_tag" ("project_id", "tag_id") VALUES ($1, $2) RETURNING *`,
    values: [projectId, tagId],
  };
  const results = await client.query(preparedQuery);
  if (!results.rows[0]) {
    throw new ApiError('Relation not found', { statusCode: 204 });
  }
  return results.rows[0]; 
}

/* Je veux retirer un tag d'un project */

const deleteProjectHasTag = async(projectId, tagId) => {
  const preparedQuery = {
    text: `DELETE FROM "project_has_tag" WHERE "project_id" = $1 AND "tag_id" = $2 RETURNING *`,
    values: [projectId, tagId],
  };
  const result = await client.query(preparedQuery);
  if (!result.rows[0]) {
    throw new ApiError('Relation not found', { statusCode: 204 });
  }
  return result.rows[0];
}
```
