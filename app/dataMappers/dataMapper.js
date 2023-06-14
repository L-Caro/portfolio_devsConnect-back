const client = require('./database');
const ApiError = require('../errors/apiError.js');

const dataMapper = {

/// --- PROJECT

  // methode listee en arrow pour tester different coding style avec requetes sql pour tous les projets
  findAllProjects: async () => {
    const results = await client.query(`
    SELECT
      "project"."id",
      "project"."title",
      "project"."description",
      "project"."availability",
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
      "project"."id" = $1;`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Project not found', { statusCode: 404 });
    }
    return results.rows[0]; 
  },

  async removeOneProject (id){
    const preparedQuery = {
      text: `WITH deleted_tags AS (
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
    FROM deleted_project;`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Project already deleted', { statusCode: 404 });
    }
    return results.rows[0];
  },

  async createOneProject(title, description, availability, user_id) {
    const preparedQuery= {
       text: `INSERT INTO "project" (title, description, availability, user_id) VALUES ($1, $2, $3, $4)`,
       values: [title, description, availability, user_id]
    }
    const results = await client.query(preparedQuery);
    return results.rows[0];
  },

  async updateOneProject (projectId, updatedFields) {
    const {title, description, availability, user_id} = updatedFields;
    const preparedQuery= {
       text: `UPDATE "project" SET title = COALESCE($1, title), description = COALESCE($2, description), availability = COALESCE($3, availability), user_id = COALESCE($4, user_id, updated_at = COALESCE($5, updated_at)) WHERE id=$6 RETURNING *`,
       values: [title, description, availability, updated_at, user_id, projectId]
    }
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Project not found', { statusCode: 404 });
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
      throw new ApiError('User not found', { statusCode: 404 });
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
      throw new ApiError('User already deleted', { statusCode: 404 });
    }
    return results.rows[0];
  },

  async createOneUser (name, firstname, email, pseudo, password, description, availability) {
    const preparedQuery= {
       text: `INSERT INTO "user" (name, firstname, email, pseudo, password, description, availability) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
       values: [name, firstname, email, pseudo, password, description, availability]
    }
    const results = await client.query(preparedQuery);
    return results.rows[0];
  },

  async updateOneUser (userId, updatedFields) {
    const {name, firstname, email, pseudo, password, description, availability} = updatedFields;
    const preparedQuery= {
       text: `UPDATE "user" SET name = COALESCE($1, name), firstname = COALESCE($2, firstname), email = COALESCE($3, email), pseudo = COALESCE($4, pseudo), password = COALESCE($5, password), description = COALESCE($6, description), availability = COALESCE($7, availability), "upadted_at" = MOW() WHERE id=$8 RETURNING *`,
       values: [name, firstname, email, pseudo, password, description, availability, userId]
    }
    const results = await client.query(preparedQuery);
    return results.rows[0];
  },

/// --- TAG

  //methode avec requete pour recuperer tous les tags
  async findAllTags (){
    const results = await client.query('SELECT * FROM "tag"');
    return results.rows; 
  },

  //methode pour recuperer un tag en fonction de l'id recue en parametre
  async findOneTag (id){
    const preparedQuery = {
      text: `SELECT * FROM tag WHERE "id" = $1`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    if (!results.rows[0]) {
      throw new ApiError('Tag not found', { statusCode: 404 });
    }
    return results.rows[0]; 
  }, 

};

module.exports = dataMapper;
