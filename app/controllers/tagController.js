const tagMapper = require('../dataMappers/tagMapper');

//controller pour les tags sans refacto d'un controllerHandler et sans gestion centralisee des erreurs
const tagController = {
    async getAllTags(_, res) {
      const tags = await tagMapper.findAllTags();
      res.json({status: 'success', data : tags})
    },

    //cette méthode récupère l'id dans les paramètres de la requête 
    async getOneTag(req, res) {
      const tagId = req.params.id;
      const tag = await tagMapper.findOneTag(tagId);
      res.json({status: 'success', data : tag})
    }

};

module.exports = tagController;
