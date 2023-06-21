const client = require('./database');
const userTagMapper = require('./userTagMapper');
const projectUserMapper = require('./projectUserMapper');
const ApiError = require('../errors/apiError.js');

const setRefreshToken = async(id, token) => {
  const preparedQuery = {
    text: 'UPDATE "user" set "refresh_token" = $2 WHERE "id" = $1 RETURNING *',
    values: [id, token],
  };
  const results = await client.query(preparedQuery);
  return results.rows;
}

const getRefreshToken = async (id) => {
  const preparedQuery = {
    text: 'SELECT "refresh_token" FROM "user" WHERE "id" = $1',
    values: [id],
  };
  const results = await client.query(preparedQuery);
  return results.rows[0].refresh_token;
}

const findAllUsers = async () => {
  const preparedQuery ={
    text: `SELECT
      "user"."id",
      "user"."name",
      "user"."firstname",
      "user"."pseudo",
      "user"."description",
      "user"."availability",
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

const findOneUser = async(id) => {
  const preparedQuery = {
    text: `SELECT
    "user"."id",
    "user"."name",
    "user"."firstname",
    "user"."pseudo",
    "user"."email",
    "user"."description",
    "user"."availability",
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
    ) AS "tags"
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

const removeOneUser = async(id) => { 
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

const createOneUser = async(name, firstname, email, pseudo, password, description, availability, tags) => {
  const preparedUserQuery = { 
    text: `INSERT INTO "user" ("name", "firstname", "email", "pseudo", "password", "description", "availability") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    values: [name, firstname, email, pseudo, password, description, availability],
  };

  const userResult = await client.query(preparedUserQuery);
  const user = userResult.rows[0];

  const parsedTags = JSON.parse(tags);

  parsedTags.forEach(async (tagId) => {
    const preparedTagQuery = {
      text: `INSERT INTO "user_has_tag" ("user_id", "tag_id") VALUES ($1, $2) RETURNING *`,
      values: [user.id, tagId],
    };

    const tagResult = await client.query(preparedTagQuery);
    return tagResult.rows[0];
  });

  return user;
}

const updateOneUser = async (userId, userUpdate) => { 
  const currentUser = await findOneUser(userId);
    if (!currentUser) {
      throw new ApiError('User not found', { statusCode: 204 });
    };

  // opérateur d'accès conditionnel (?.) remplace if pour gérer les cas où currentProject.tags ou projectUpdate.tags sont null ou undefined
  const UpdatedTags = JSON.parse(userUpdate.tags); // Convertit la string des updatedTags pour comparer avec les actuels
  const currentUserTags = currentUser.tags.map(tag => tag.id);
  
  // Id des tags au lieu des objets complets
  const tagsToDelete = currentUserTags?.filter(tagId => !UpdatedTags?.includes(tagId)) || [];
    console.log(tagsToDelete);
    for (const tagId of tagsToDelete) {
      await userTagMapper.deleteUserHasTag(userId, tagId);
    }
    
  const tagsToAdd = UpdatedTags?.filter(tagId => !currentUserTags?.includes(tagId)) || [];
    for (const tagId of tagsToAdd) {
      await userTagMapper.createUserHasTag(userId, tagId);
    }
    
  const preparedQuery = {
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
      userId
    ],
  };

  const [results] = (await client.query(preparedQuery)).rows;

  return results;
};

const findUserByEmail = async(email) => {
  const preparedQuery = {
    text: `SELECT * FROM "user"
           WHERE "email" = $1`,
    values: [email],
  };

  const results = await client.query(preparedQuery);
  return results.rows[0];
}

module.exports = {
  setRefreshToken,
  getRefreshToken,
  findAllUsers,
  findOneUser,
  removeOneUser,
  createOneUser,
  updateOneUser,
  findUserByEmail
};
