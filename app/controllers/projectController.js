const dataMapper = require("../dataMappers/dataMapper");

const projectController = {
    async getAllProjects(_, res) {
      const projects = await dataMapper.findAllProjects();
      res.json({status: 'success', data : projects})
    },

    async getOneProject(req, res) {
      const projectId = req.params.id;
      const project = await dataMapper.findOneProject(projectId);
      res.json({status: 'success', data : project})
    }

};

module.exports = projectController;

