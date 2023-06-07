const client = require('./database');

const dataMapper = {

  findAllProjects: async () => {
    const results = await client.query("SELECT * FROM project");
    return results.rows; 
  },
  
};

module.exports = dataMapper;
