const projectMapper = require('../dataMappers/projectMapper');

//controller pour les projets sans refacto d'un controllerHandler et sans gestion centralisee des erreurs

const projectController = {
    async getAllProjects(_, res) {
      const projects = await projectMapper.findAllProjects();
      res.json({status: 'success', data: projects})
    },

    //cette methode recupere l'id dans les parametres de la requete 
    async getOneProject(req, res) {
      const projectId = req.params.id;
      const project = await projectMapper.findOneProject(projectId);
      res.json({status: 'success', data: project})
    },

    async deleteOneProject(req, res) {
      const projectId = req.params.id;
      const project = await projectMapper.removeOneProject(projectId);
      res.json({status: 'success', data: project })
    },

    async addOneProject(req, res) {
      const { title, description, availability, tags } = req.body;
      const project = await projectMapper.createOneProject(title, description, availability, tags);
      res.json({status: 'success', data: project })
    },

    async editOneProject(req, res) {
      const projectId = req.params.id;
      const { title, description, availability, tags, users } = req.body;
      const project = await projectMapper.updateOneProject(projectId, {title, description, availability, tags, users});
      res.json({status: 'success', data: project })
    }

};

module.exports = projectController;
