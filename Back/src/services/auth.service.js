const boom = require('@hapi/boom');
const { OAuth2Client } = require('google-auth-library');
const { models } = require('../libs/sequelize');
const UserService = require('./user.service');

function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw boom.internal('GOOGLE_CLIENT_ID no configurado');
  }
  return new OAuth2Client(clientId);
}

class AuthService {
  constructor() {
    this.userService = new UserService();
  }

  async loginWithGoogle(credential) {
    const client = getGoogleClient();
    let payload;

    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw boom.unauthorized('Token de Google inválido o expirado');
    }

    if (!payload?.email || !payload.sub) {
      throw boom.unauthorized('No se pudo obtener el perfil de Google');
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || email.split('@')[0];
    const avatarUrl = payload.picture || null;

    let user = await models.User.unscoped().findOne({ where: { googleId } });

    if (!user) {
      user = await models.User.unscoped().findOne({ where: { email } });
      if (user) {
        await user.update({
          googleId,
          avatarUrl,
          name: user.name || name,
        });
      } else {
        user = await models.User.create({
          name,
          email,
          password: null,
          googleId,
          avatarUrl,
          role: 'user',
        });
      }
    } else if (avatarUrl && user.avatarUrl !== avatarUrl) {
      await user.update({ avatarUrl, name: user.name || name });
    }

    const token = this.userService.signToken(user);
    return {
      token,
      user: UserService.toPublicUser(user),
    };
  }
}

module.exports = AuthService;
