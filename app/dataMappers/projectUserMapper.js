const client = require('./database');
const ApiError = require('../errors/apiError.js');

const createProjectHasUser = async(projectID, userID) => {
  const preparedQuery = {
    text: `INSERT INTO "project_has_user" ("project_id", "user_id") VALUES ($1, $2) RETURNING *`,
    values: [projectID, userID],
  };
  const results = await client.query(preparedQuery);
  if (!results.rows[0]) {
    throw new ApiError('Relation not found', { statusCode: 204 });
  }
  return results.rows[0]; 
}

/* Je veux modifier le statut d'un user dans un projet en modifiant le boolean is active */

const updateProjectHasUser = async(projectID, userID) => {
  const result = await client.query(`UPDATE "project_has_user" 
    SET "is_active" = NOT"is_active"
    WHERE "project_has_user"."project_id" = ${projectID} 
    AND "project_has_user"."user_id" = ${userID} 
    RETURNING *`
  );
  if (!result.rows[0]) {
    throw new ApiError('Relation not found', { statusCode: 204 });
  }
  return result.rows[0]; 
}

/* Je veux retirer un user d'un project */

const deleteProjectHasUser = async(projectID, userID) => {
  const preparedQuery = {
    text: `DELETE FROM "project_has_user" ("project_id", "user_id") VALUES ($1, $2) RETURNING *`,
    values: [projectID, userID],
  };
  const result = await client.query(preparedQuery);
  if (!result.rows[0]) {
    throw new ApiError('Relation not found', { statusCode: 204 });
  }
  return result.rows[0];
}

module.exports = { 
  createProjectHasUser, 
  updateProjectHasUser, 
  deleteProjectHasUser 
};
