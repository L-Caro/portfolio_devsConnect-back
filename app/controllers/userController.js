const dataMapper = require("../dataMappers/dataMapper");

const userController = {
    async getAllUsers(_, res) {
      const users = await dataMapper.findAllUsers();
      res.json({status: 'success', data : users})
    },

    async getOneUser(req, res) {
      const userId = req.params.id;
      const user = await dataMapper.findOneUser(userId);
      res.json({status: 'success', data : user})
    },

    async deleteOneUser(req, res) {
      const userId = req.params.id;
      const user = await dataMapper.removeOneUser(userId);
      res.json({status: 'success', data: user })
    },

    async addOneUser(req, res) {
      const { name, firstname, email, pseudo, password, description, availability } = req.body;
      const user = await dataMapper.createOneUser(name, firstname, email, pseudo, password, description, availability);
      res.json({status: 'success', data: user })
    },

    async editOneUser(req, res) {
      const userId = req.params.id;
      const { name, firstname, email, pseudo, password, description, availability } = req.body;
      const user = await dataMapper.updateOneUser(userId, {name, firstname, email, pseudo, password, description, availability});
      res.json({status: 'success', data: user })
    }
};

module.exports = userController;
