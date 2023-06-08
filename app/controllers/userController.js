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
    }

};

module.exports = userController;
