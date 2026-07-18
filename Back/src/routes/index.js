const express = require('express');
const usersRouter = require('./users.router');
const authRouter = require('./auth.router');
const propertiesRouter = require('./properties.router');
const { defaultApiLimiter, authApiLimiter } = require('../middlewares/rateLimiters');

const DEBUG_ROUTES = process.env.DEBUG_ROUTES === '1';

function routerApi(app) {
  const router = express.Router();
  app.use('/api', router);

  if (DEBUG_ROUTES) {
    console.log('Cargando rutas API LM Negocios Inmobiliarios...');
  }

  router.get('/', (req, res) => {
    res.json({
      ok: true,
      service: 'lmneg-inmobiliarios-api',
      endpoints: {
        health: 'GET /health',
        register: 'POST /api/users/register',
        login: 'POST /api/users/login',
        googleAuth: 'POST /api/auth/google',
        me: 'GET /api/users/me',
        myProperties: 'GET /api/properties/mine',
        properties: 'GET /api/properties',
        propertyBySlug: 'GET /api/properties/slug/:slug',
        createProperty: 'POST /api/properties',
      },
    });
  });

  router.use('/auth', authApiLimiter, authRouter);
  router.use('/users', authApiLimiter, usersRouter);
  router.use('/properties', defaultApiLimiter, propertiesRouter);
}

module.exports = routerApi;
