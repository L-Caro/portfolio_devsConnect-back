const dataMapper = require("../dataMappers/dataMapper");
const bcrypt = require('bcrypt');

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
      const { name, firstname, email, pseudo, password, description, availability, tags } = req.body;
      const user = await dataMapper.createOneUser(name, firstname, email, pseudo, password, description, availability, tags);
      res.json({status: 'success', data: user })
    },

    //methode pour s'enregistrer
    async register(req, res, next) {
      const { name, firstname, email, pseudo, password, description, availability } = req.body;
      const hashedPWD = await bcrypt.hash(password, 10);
      if (!name || !firstname || !email || !pseudo || !password) {
        throw new ApiError('Missing information', { statusCode: 400 });
      }
      await dataMapper.createOneUser(name, firstname, email, pseudo, hashedPWD, description, availability);
      res.json({status: 'success' });
    },

    async editOneUser(req, res) {
      const userId = req.params.id;
      const { name, firstname, email, pseudo, password, description, availability } = req.body;
      const user = await dataMapper.updateOneUser(userId, {name, firstname, email, pseudo, password, description, availability});
      res.json({status: 'success', data: user })
    }
};

module.exports = userController;
