const bcrypt = require('bcrypt');
const dataMapper = require('../dataMappers/dataMapper');
const auth = require('../auth');

const authController = {
  async login(request, response, next) {
    const { password, email } = request.body;
    // retrieve user from db
    const user = await dataMapper.findUserByEmail(email);
    if (user) {
      // check if provided password match with hash
      if (await bcrypt.compare(password, user.password)) {
        return authController.sendTokens(response, request.ip, user);
      }
    }
    throw new ApiError('Forbidden', { statusCode: 403 }));
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
      return authController.sendTokens(response, request.ip, user);
    }
    throw new ApiError('Unauthorized', { statusCode: 401 });
  },

  async sendTokens(response, ip, user) {
    const userID = user.id;
    // create an access token
    const accessToken = auth.generateAccessToken(ip, user);
    // create a refresh token
    const refreshToken = auth.generateRefreshToken(userID);
    // save refresh token to db
    await dataMapper.setRefreshToken(user.id, refreshToken);
    // send tokens to client
    return response.status(200).json({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
        userID,
      },
    });
  },
};

module.exports = authController;
