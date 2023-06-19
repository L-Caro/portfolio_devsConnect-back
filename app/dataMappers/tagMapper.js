const client = require('./database');
const ApiError = require('../errors/apiError.js');

const findAllTags = async () => {
  const allTags = await client.query(`SELECT * FROM "tag"`);
  if (!allTags.rows) {
    throw new ApiError('Tags not found', { statusCode: 204 });
  }
  return results.rows; 
}

//methode pour recuperer un tag en fonction de l'id recue en parametre
const findOneTag = async(id) => {
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

module.exports = { 
  findAllTags, 
  findOneTag 
};
