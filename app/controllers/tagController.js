const dataMapper = require("../dataMappers/dataMapper");

const tagController = {
    async getAllTags(_, res) {
      const tags = await dataMapper.findAllTags();
      res.json({status: 'success', data : tags})
    },

    async getOneTag(req, res) {
      const tagId = req.params.id;
      const tag = await dataMapper.findOneTag(tagId);
      res.json({status: 'success', data : tag})
    }

};

module.exports = tagController;

