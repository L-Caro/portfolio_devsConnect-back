const client = require('./database');

const dataMapper = {

/// --- PROJECT

  // methode listee en arrow pour tester different coding style avec requetes sql pour tous les projets
  findAllProjects: async () => {
    const results = await client.query('SELECT * FROM "project"');
    return results.rows; 
  },

  //methode pour recuperer un seul projet a partir de l'id recu en parametre
  async findOneProject (id){
    const preparedQuery = {
      text: `SELECT * FROM "project" WHERE "id" = $1`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    return results.rows[0]; 
  },

  async removeOneProject (id){
    const preparedQuery = {
      text: `DELETE FROM "project" WHERE "id" = $1`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
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

/// --- USER

  findAllUsers: async () => {
    const results = await client.query('SELECT * FROM "user"');
    return results.rows; 
  },

  async findOneUser (id){
    const preparedQuery = {
      text: `SELECT * FROM "user" WHERE "id" = $1`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    return results.rows[0]; 
  },

  async removeOneUser (id){
    const preparedQuery = {
      text: `DELETE FROM "user" WHERE "id" = $1`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    return results.rows[0];
  },

  async createOneUser (name, firstname, email, pseudo, password, description, availability) {
    const preparedQuery= {
       text: `INSERT INTO "user" (name, firstname, email, pseudo, password, description, availability) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
       values: [name, firstname, email, pseudo, password, description, availability]
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
    return results.rows[0]; 
  }, 

};

module.exports = dataMapper;
