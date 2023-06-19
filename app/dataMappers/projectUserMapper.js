const client = require('./database');
const ApiError = require('../errors/apiError.js');

// devient postulant à un projet  POST /api/users/:id/projects/:projectId 
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

// Je veux modifier le statut d'un postulant en is_active true : bouton Accepter  PUT /api/users/:id/projects/:projectId
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

// Je refuse un user postulant à un project : bouton Refuser ou Me retirer  DELETE /api/users/:id/projects/:projectId
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

module.exports = { 
  createProjectHasUser, 
  updateProjectHasUser, 
  deleteProjectHasUser 
};
