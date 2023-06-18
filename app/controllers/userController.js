const userMapper = require('../dataMappers/userMapper');
const bcrypt = require('bcrypt');
const ApiError = require('../errors/apiError.js');

const userController = {
    async getAllUsers(_, res) {
      const users = await userMapper.findAllUsers();
      res.json({status: 'success', data : users})
    },

    async getOneUser(req, res) {
      const userId = req.params.id;
      const user = await userMapper.findOneUser(userId);
      res.json({status: 'success', data : user})
    },

    async deleteOneUser(req, res) {
      const userId = req.params.id;
      const user = await userMapper.removeOneUser(userId);
      res.json({status: 'success', data: user })
    },

    //methode pour s'enregistrer
    async register(req, res, next) {
      const { name, firstname, email, pseudo, password, description, availability, tags } = req.body;
      const hashedPWD = await bcrypt.hash(password, 10);
      if (!name || !firstname || !email || !pseudo || !password) {
        throw new ApiError('Missing information', { statusCode: 400 });
      }
      await userMapper.createOneUser(name, firstname, email, pseudo, hashedPWD, description, availability, tags);
      res.json({status: 'success' });
    },

    async editOneUser(req, res) {
      const userId = req.params.id;
      const { name, firstname, email, pseudo, password, description, availability, tags, projects } = req.body;
      const user = await userMapper.updateOneUser(userId, {name, firstname, email, pseudo, password, description, availability, tags, projects});
      res.json({status: 'success', data: user })
    }
};

module.exports = userController;
