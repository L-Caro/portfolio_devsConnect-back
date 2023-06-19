const client = require('./database');
const projectTagMapper = require('./projectTagMapper');
const projectUserMapper = require('./projectUserMapper');
const ApiError = require('../errors/apiError.js');


// methode listee en arrow pour tester different coding style avec requetes sql pour tous les projets
const findAllProjects = async () => {
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
const findOneProject = async (id) => {
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

const removeOneProject = async(id) => {
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

const createOneProject = async(title, description, availability, user_id, tags) => {
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
}

// TODO il faut ajouter une relation project_has_user

  return project;
}

/* Je veux mettre à jour les champs title, description, availability, 
  avec les tags qui lui sont associés, ayant une relation project/tag dans la table project_has_tag
  et les users qui lui sont associés, ayant une relation project/user dans la table project_has_user
  et je veux que ça me renvoie le projet avec les tags et les users mis à jour */
 
  //projectUpdate = {title, description, availability, tags, users}
  const updateOneProject = async (projectId, projectUpdate) => {
    // Récupérer le projet actuel avec les tags et les utilisateurs
    const currentProject = await findOneProject(projectId);
    if (!currentProject) {
      throw new ApiError('Project not found', { statusCode: 204 });
    }
  
    // Supprimer les tags absents
    const tagsToDelete = currentProject.tags.filter(
      (tag) => !projectUpdate.tags.some((updatedTag) => updatedTag.id === tag.tag_id)
    );
    if (tagsToDelete.length > 0) {
      await projectTagMapper.deleteProjectHasTag(projectId, tagsToDelete.map((tag) => tag.tag_id));
    }
    console.log('deleted');
  
    // Ajouter les nouveaux tags
    const tagsToAdd = projectUpdate.tags.filter(
      (updatedTag) => !currentProject.tags.some((tag) => tag.tag_id === updatedTag.id)
      // TODO : vérifier si ça bloque quand on n'entre pas de tag à mettre à jour
      // si projectUpdate.tags est undefined --> projectUpdate.tags && projectUpdate.tags.some : la condition sera évaluée à false et plus undefined
    );
    if (tagsToAdd.length > 0) {
      await projectTagMapper.createProjectHasTag(projectId, tagsToAdd.map((tag) => tag.id));
    }
    console.log('created');
  
    // Mettre à jour le statut is_active des utilisateurs
    const usersToUpdate = projectUpdate.users.filter((updatedUser) => {
      const currentUser = currentProject.users.find(
        (user) => user.user_id === updatedUser.id && user.is_active !== updatedUser.is_active
      );
      return currentUser !== undefined;
    });
    if (usersToUpdate.length > 0) {
      await projectUserMapper.updateProjectHasUser(projectId, usersToUpdate.map((user) => user.id));
    }
  
    // Mettre à jour les champs du projet
    const preparedQuery = {
      text: `UPDATE "project" 
        SET title = COALESCE($1, title), 
          description = COALESCE($2, description), 
          availability = COALESCE($3, availability)
        WHERE id=$4 RETURNING *`,
      values: [projectUpdate.title, projectUpdate.description, projectUpdate.availability, projectId],
    };
  
    const results = await client.query(preparedQuery);
    const project = results.rows[0];
  
    return project;
  };

  module.exports = {
    findAllProjects,
    findOneProject,
    removeOneProject,
    createOneProject,
    updateOneProject
  };
