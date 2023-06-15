/* const client = require('./database');

const dataMapper = {
  async createOneUser(name, firstname, email, pseudo, password, description, availability, tags) {
    const preparedUserQuery = {
      text: `INSERT INTO "user" (name, firstname, email, pseudo, password, description, availability) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      values: [name, firstname, email, pseudo, password, description, availability],
    };
  
    const userResult = await client.query(preparedUserQuery);
    const user = userResult.rows[0];
  
    const addTagsToUser = tags.map(async (tagId) => {
      // Effectuer des opérations asynchrones : la requête à la base de données
      const preparedTagQuery = {
        text: `INSERT INTO "user_has_tag" ("user_id", "tag_id") VALUES ($1, $2) RETURNING *`,
        values: [user.id, tagId],
      };
  
      const tagResult = await client.query(preparedTagQuery);
      return tagResult.rows[0];
    });
  
  // Attendre que toutes les opérations asynchrones se terminent
    await Promise.all(addTagsToUser);
  
    return user; // Tableau des résultats des opérations asynchrones
  }
}

module.exports = dataMapper; */
