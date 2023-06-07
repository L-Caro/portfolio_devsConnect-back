const client = require('./database');

const dataMapper = {

  findAllProjects: async () => {
    const results = await client.query("SELECT * FROM projects");
    return results.rows; 
  },
  
};

module.exports = dataMapper;
