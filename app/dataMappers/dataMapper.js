const client = require('./database');

const dataMapper = {

  findAllProjects: async () => {
    const results = await client.query("SELECT * FROM project");
    return results.rows; 
  },

  async findOneProject (id){
    const preparedQuery = {
      text: `SELECT * FROM project WHERE "id" = $1`,
      values: [id],
    };
    const results = await client.query(preparedQuery);
    return results.rows[0]; 
  },

  async findAllTags (){
    const results = await client.query("SELECT * FROM tag");
    return results.rows; 
  },

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
