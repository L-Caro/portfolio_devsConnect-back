const client = require('./database');
const ApiError = require('../errors/apiError.js');

const dataMapper = {

  async setRefreshToken(id, token) {
    const preparedQuery = {
      text: 'UPDATE "user" set "refresh_token" = $2 WHERE "id" = $1 RETURNING *',
      values: [id, token],
    };
    const results = await client.query(preparedQuery);
    return results.rows;
  },

  async findUserByEmail(email) {
    const preparedQuery = {
      text: `SELECT * FROM "user"
             WHERE "email" = $1`,
      values: [email],
    };

    const results = await client.query(preparedQuery);
    return results.rows[0];
  },

  async findProjectOwner(projectId) {
    const preparedQuery = {
      text: `SELECT "project"."user_id" FROM "project"
             WHERE "project"."id" = $1`,
      values: [projectId],
    };

    const results = await client.query(preparedQuery);
    return results.rows[0].user_id;
  },

/// --- PROJECT

  // methode listee en arrow pour tester different coding style avec requetes sql pour tous les projets
  findAllProjects: async () => {
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
      ) AS tags,
      (
        SELECT json_agg(json_build_object('id', "user"."id", 'name', "user"."name"))
        FROM (
          SELECT DISTINCT "user"."id", "user"."name"
          FROM "user"
          INNER JOIN "project_has_user" ON "user"."id" = "project_has_user"."user_id"
          WHERE "project_has_user"."project_id" = "project"."id"
        )AS "user"
      ) AS users
    FROM "project"
    GROUP BY
      "project"."id";
    `);
    return results.rows; 
  },

  //methode pour recuperer un seul projet a partir de l'id recu en parametre
  async findOneProject (id){
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
      ) AS tags,
      (
          SELECT json_agg(json_build_object('user_id', "user"."id", 'user_pseudo', "user"."pseudo"))
          FROM (
              SELECT DISTINCT ON ("user"."id") "user"."id", "user"."pseudo"
              FROM "user"
              INNER JOIN "project_has_user" ON "project_has_user"."user_id" = "user"."id"
              WHERE "project_has_user"."project_id" = "project"."id"
              ORDER BY "user"."id"
          ) AS "user"
      ) AS users
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
  },

  async removeOneProject (id){
    const preparedQuery = {
      text: `DELETE FROM "project" WHERE "id" = $1 RETURNING *`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Project already deleted', { statusCode: 204 });
    }
    return results.rows[0];
  },

  async createOneProject(title, description, availability, user_id, tags) {
    const preparedProjectQuery= {
       text: `INSERT INTO "project" (title, description, availability, user_id) VALUES ($1, $2, $3, $4) RETURNING *`,
       values: [title, description, availability, user_id]
    }
    const projectResults = await client.query(preparedProjectQuery);
    const project = await projectResults.rows[0];

    const addTagsToProject = tags.map(async (tagId) => {
      const preparedTagQuery = {
          text: `INSERT INTO "project_has_tag" ("project_id", "tag_id") VALUES ($1, $2) RETURNING *`,
          values: [project.id, tagId],
        };
    
    const tagResults = await client.query(preparedTagQuery);
    return tagResults.rows[0];
    });

    await Promise.all(addTagsToProject);

    return project;
  },

  async updateOneProject (projectId, updatedFields) {
    const {title, description, availability, user_id} = updatedFields;
    const preparedQuery= {
       text: `UPDATE "project" SET title = COALESCE($1, title), description = COALESCE($2, description), availability = COALESCE($3, availability), user_id = COALESCE($4, user_id), updated_at = NOW() WHERE id=$5 RETURNING *`,
       values: [title, description, availability, user_id, projectId]
    }
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Project not found', { statusCode: 204 });
    }
    return results.rows[0]; 
  },

/// --- USER

  findAllUsers: async () => {
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
        ) AS projects,
        (
          SELECT json_agg(json_build_object('id', "tag"."id", 'name', "tag"."name"))
          FROM (
            SELECT DISTINCT "tag"."id", "tag"."name"
            FROM "tag"
            INNER JOIN "user_has_tag" ON "tag"."id" = "user_has_tag"."tag_id"
            WHERE "user_has_tag"."user_id" = "user"."id"
          ) AS "tag"
        )AS tags
      FROM "user"`};
    const results = await client.query(preparedQuery);
    return results.rows; 
  },

  async findOneUser (id){
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
      ) AS projects,
      (
        SELECT json_agg(json_build_object('id', "tag"."id", 'name', "tag"."name"))
        FROM (
          SELECT DISTINCT "tag"."id", "tag"."name"
          FROM "tag"
          INNER JOIN "user_has_tag" ON "tag"."id" = "user_has_tag"."tag_id"
          WHERE "user_has_tag"."user_id" = "user"."id"
        ) AS "tag"
      )AS tags
    FROM "user"
    WHERE "id" = $1`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('User not found', { statusCode: 204 });
    }
    return results.rows[0]; 
  },

  async removeOneUser (id){
    const preparedQuery = {
      text: `DELETE FROM "user" WHERE "id" = $1 RETURNING *`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('User already deleted', { statusCode: 204 });
    }
    return results.rows[0];
  },

  async createOneUser(name, firstname, email, pseudo, password, description, availability, tags) {
    const preparedUserQuery = {
      text: `INSERT INTO "user" (name, firstname, email, pseudo, password, description, availability) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      values: [name, firstname, email, pseudo, password, description, availability],
    };
  
    const userResult = await client.query(preparedUserQuery);
    const user = userResult.rows[0];
  
    const addTagsToUser = tags.map(async (tag) => {
      const tagId = tag.id;
      const preparedTagQuery = {
        text: `INSERT INTO "user_has_tag" ("user_id", "tag_id") VALUES ($1, $2) RETURNING *`,
        values: [user.id, tagId],
      };
  
      const tagResult = await client.query(preparedTagQuery);
      return tagResult.rows[0];
    });
  
  // Fonction native : attendre que toutes les opérations asynchrones se terminent
    await Promise.all(addTagsToUser);
  
    return user; // Tableau des résultats des opérations asynchrones
  },

  async updateOneUser (userId, updatedFields) { 
    const {name, firstname, email, pseudo, password, description, availability} = updatedFields;
    const preparedQuery= { // vérifier si le password n'est pas renvoyé en clair et le retirer du return
       text: `UPDATE "user" SET name = COALESCE($1, name), firstname = COALESCE($2, firstname), email = COALESCE($3, email), pseudo = COALESCE($4, pseudo), password = COALESCE($5, password), description = COALESCE($6, description), availability = COALESCE($7, availability), updated_at = NOW() WHERE id=$8 RETURNING *`,
       values: [name, firstname, email, pseudo, password, description, availability, userId]
    }
    const results = await client.query(preparedQuery);
    return results.rows[0];
  },

  //methode pour recuperer un tag en fonction de l'id recue en parametre
  async findOneTag (id){
    const preparedQuery = {
      text: `SELECT * FROM tag WHERE "id" = $1`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Tag not found', { statusCode: 204 });
    }
    return results.rows[0]; 
  }, 

};

module.exports = dataMapper;
