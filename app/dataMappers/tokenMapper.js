const client = require('./database');
const ApiError = require('../errors/apiError.js');

const setRefreshToken = async(id, token) => {
    const preparedQuery = {
      text: 'UPDATE "user" set "refresh_token" = $2 WHERE "id" = $1 RETURNING *',
      values: [id, token],
    };
    const results = await client.query(preparedQuery);
    return results.rows;
  }

module.exports = { setRefreshToken };
