const dataMapper = require("../dataMappers/dataMapper");

//controller pour les projets sans refacto d'un controllerHandler et sans gestion centralisee des erreurs

const projectController = {
    async getAllProjects(_, res) {
      const projects = await dataMapper.findAllProjects();
      res.json({status: 'success', data: projects})
    },

    //cette methode recupere l'id dans les parametres de la requete 
    async getOneProject(req, res) {
      const projectId = req.params.id;
      const project = await dataMapper.findOneProject(projectId);
      res.json({status: 'success', data: project})
    },

    async deleteOneProject(req, res) {
      const projectId = req.params.id;
      const project = await dataMapper.removeOneProject(projectId);
      res.json({status: 'success', data: project })
    },

    async addOneProject(req, res) {
      const { title, description, availability, user_id } = req.body;
      const project = await dataMapper.createOneProject(title, description, availability, user_id);
      res.json({status: 'success', data: project })
    }

};

module.exports = projectController;

