const dataMapper = require("../dataMappers/dataMapper");

const projectController = {
    async getAllProjects(_, res) {
      try{
        const projects = await dataMapper.findAllProjects();
        res.json({status: 'success', data : projects})
      } catch (error){
        res.status(500).send('No Data')
      }
    }
};

module.exports = projectController;

