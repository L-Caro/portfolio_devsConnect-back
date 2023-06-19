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

const getRefreshToken = async(id) => {
  // TODO : où est la fonction ? 
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

  tags.forEach(async (tagId) => {
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

  if (userUpdate.tags) {
    const currentUserTags = currentUser.tags;
  
    const tagsToDelete = currentUserTags.filter(
      (tag) => !userUpdate.tags.some((updatedTag) => updatedTag === tag.tag_id)
    );
    const tagsToCreate = userUpdate.tags.filter(
      (tag) => !currentUserTags.some((existingTag) => existingTag.tag_id === tag)
    );
  
    await Promise.all([
      ...tagsToDelete.map((tag) => userTagMapper.deleteUserHasTag(userId, tag.id)),
      ...tagsToCreate.map((tag) => userTagMapper.createUserHasTag(userId, tag)),
    ]);
  };

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
