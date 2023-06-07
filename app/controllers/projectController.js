const dataMapper = require("../dataMappers/dataMapper");

const projectController = {
    async getAllProjects(_, res) {
      const projects = await dataMapper.findAllProjects();
      res.json({status: 'success', data : projects})

    }
};

module.exports = projectController;

