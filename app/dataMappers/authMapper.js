const client = require('./database');
const ApiError = require('../errors/apiError.js');

const findProjectOwner = async(projectId) => {
  const preparedQuery = {
    text: `SELECT "project"."user_id" FROM "project"
           WHERE "project"."id" = $1`,
    values: [projectId],
  };

  const results = await client.query(preparedQuery);
  return results.rows[0].user_id;
}

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
  findProjectOwner,
  setRefreshToken,
  findUserByEmail
};
