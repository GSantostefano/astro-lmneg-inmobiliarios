const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');

function getTokenFromHeader(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

function authHandler(req, res, next) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      throw boom.unauthorized('Token requerido');
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw boom.internal('JWT_SECRET no configurado');
    }
    const payload = jwt.verify(token, secret);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch (error) {
    if (error.isBoom) return next(error);
    return next(boom.unauthorized('Token inválido o expirado'));
  }
}

function optionalAuthHandler(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    // ignore invalid optional token
  }
  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(boom.unauthorized('Autenticación requerida'));
    }
    if (!roles.includes(req.user.role)) {
      return next(boom.forbidden('No tenés permisos para esta acción'));
    }
    return next();
  };
}

module.exports = {
  authHandler,
  optionalAuthHandler,
  requireRole,
};
