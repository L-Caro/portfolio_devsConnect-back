/* eslint-disable max-len */
const bcrypt = require('bcrypt');
const userMapper = require('../dataMappers/userMapper');
const auth = require('../auth');
const ApiError = require('../errors/apiError');
const uploadPicture = require('../middleware/uploadPicture');

const userController = {
  async login(request, response, next) {
    const { password, email } = request.body;
    // retrieve user from db
    const user = await userMapper.findUserByEmail(email);
    if (user) {
      // check if provided password match with hash
      if (await bcrypt.compare(password, user.password)) {
        return userController.sendTokens(response, request.ip, user);
      }
    }
    throw new ApiError('Forbidden', { statusCode: 403 });
  },

  async tokenRefresh(request, response, next) {
    const { refreshToken } = request.body;
    const authHeader = request.headers.authorization;

    if (!authHeader || !refreshToken) {
      return next(new Error401());
    }
    // check if refreshToken is valid
    if (await auth.isValidRefreshToken(refreshToken)) {
      // get expired access token
      const token = authHeader.split('Bearer ')[1];
      // get user from expired access token
      const user = await auth.getTokenUser(token);
      // send new tokens
      return userController.sendTokens(response, request.ip, user);
    }
    throw new ApiError('Unauthorized', { statusCode: 401 });
  },

  async sendTokens(response, ip, user) {
    const userId = user.id;
    // create an access token
    const accessToken = auth.generateAccessToken(ip, user);
    // create a refresh token
    const refreshToken = auth.generateRefreshToken(userId);
    // save refresh token to db
    await userMapper.setRefreshToken(user.id, refreshToken);
    // send tokens to client
    return response.status(200).json({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
        userId,
        logged: true,
        pseudo: user.pseudo,
      },
    });
  },

  async getAllUsers(_, res) {
    const users = await userMapper.findAllUsers();
    // const users = await userMapper.getAllUsers();
    res.json({ status: 'success', data: users });
  },

  // cette méthode récupère l'id dans les paramètres de la requête
  async getOneUser(req, res) {
    const userId = req.params.id;
    const user = await userMapper.findOneUser(userId);
    // const user = await userMapper.getUserById(userId);
    res.json({ status: 'success', data: user });
  },

  async deleteOneUser(req, res) {
    const userId = req.params.id;
    const user = await userMapper.removeOneUser(userId);
    res.json({ status: 'success', data: user });
  },

  // méthode pour s'enregistrer / création d'un nouvel utilisateur
  // cette méthode récupère les données dans le body de la requête
  async register(req, res) {
    const {
      lastname, firstname, email, pseudo, password, description, availability, tags,
    } = req.body;
    const hashedPWD = await bcrypt.hash(password, 10);

    if (!lastname || !firstname || !email || !pseudo || !password) {
      throw new ApiError('Missing information', { statusCode: 400 });
    }

    const existingEmail = await userMapper.findUserByEmail(email);
    if (existingEmail) {
      throw new ApiError('Email already used', { statusCode: 400 });
    }

    const existingPseudo = await userMapper.findUserByPseudo(pseudo);
    if (existingPseudo) {
      throw new ApiError('Pseudo already used', { statusCode: 400 });
    }

    // Si un fichier a été téléchargé, appelez uploadPicture pour traiter la photo de profil
    if (req.file) {
      await uploadPicture(req, res, pseudo);
    }
    await userMapper.createOneUser(lastname, firstname, email, pseudo, hashedPWD, description, availability, tags);
    res.json({ status: 'success' });
  },

  async editOneUser(req, res) {
    const userId = req.params.id;
    const {
      lastname, firstname, email, pseudo, password, description, availability, tags,
    } = req.body;
    const update = {
      lastname, firstname, email, pseudo, description, availability, tags,
    };

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      update.password = hashed;
    }

    const user = await userMapper.updateOneUser(userId, update);
    res.json({ status: 'success', data: user });
  },

  async checkPassword(req, res) {
    // console.log(req.body);
    const { oldPassword, id } = req.body;

    const user = await userMapper.findOneUserX(id);

    bcrypt.compare(oldPassword, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la vérification du mot de passe' });
      }

      if (!result) {
        return res.json({ message: 'L\'ancien mot de passe est incorrect', status: 'error' });
      }
      return res.json({ message: 'L\'ancien mot de passe est correct', status: 'success' });
    });
  },
  async checkPseudo(req, res) {
    const { oldPseudo } = req.body;

    const users = await userMapper.findAllUsers();
    // console.log('users', users);
    const foundUser = users.find((user) => user.pseudo === oldPseudo);

    if (foundUser) {
      return res.json({ message: 'Le pseudo n\'est pas disponible', status: 'error' });
    }
    return res.json({ message: 'Le pseudo est disponible', status: 'success' });
  },
  async checkEmail(req, res) {
    const { oldEmail } = req.body;
    const users = await userMapper.findAllUsers();
    const foundUser = users.find((user) => user.email === oldEmail);
    if (foundUser) {
      return res.json({ message: 'L\'email n\'est pas disponible', status: 'error' });
    }
    return res.json({ message: 'L\'email est disponible', status: 'success' });
  },
};

module.exports = userController;
