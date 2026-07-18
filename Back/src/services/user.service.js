const boom = require('@hapi/boom');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { models } = require('../libs/sequelize');

function toPublicUser(user) {
  const json = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  delete json.password;
  return json;
}

class UserService {
  async register(data) {
    const existing = await models.User.unscoped().findOne({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      throw boom.conflict('Ya existe un usuario con ese email');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await models.User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: passwordHash,
      phone: data.phone || null,
      role: data.role === 'admin' ? 'admin' : 'user',
    });

    return toPublicUser(user);
  }

  async login({ email, password }) {
    const user = await models.User.unscoped().findOne({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      throw boom.unauthorized('Email o contraseña incorrectos');
    }

    if (!user.password) {
      throw boom.unauthorized('Esta cuenta usa Google. Ingresá con Google.');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw boom.unauthorized('Email o contraseña incorrectos');
    }

    const token = this.signToken(user);
    return {
      token,
      user: toPublicUser(user),
    };
  }

  signToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw boom.internal('JWT_SECRET no configurado');
    }
    return jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      secret,
      {
        subject: String(user.id),
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    );
  }

  async find() {
    return models.User.findAll({
      order: [['id', 'ASC']],
    });
  }

  async findOne(id) {
    const user = await models.User.findByPk(id);
    if (!user) {
      throw boom.notFound('Usuario no encontrado');
    }
    return user;
  }

  async update(id, changes) {
    const user = await this.findOne(id);
    const payload = { ...changes };
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }
    if (payload.email) {
      payload.email = payload.email.toLowerCase();
    }
    const updated = await user.update(payload);
    return toPublicUser(updated);
  }

  async delete(id) {
    const user = await this.findOne(id);
    await user.destroy();
    return { id: Number(id) };
  }
}

module.exports = UserService;
module.exports.toPublicUser = toPublicUser;
