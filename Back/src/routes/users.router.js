const express = require('express');
const UserService = require('../services/user.service');
const PropertyService = require('../services/property.service');
const validatorHandler = require('../middlewares/validator.handler');
const { authHandler, requireRole } = require('../middlewares/auth.handler');
const { listPropertiesQuerySchema } = require('../schemas/property.schema');
const {
  registerSchema,
  loginSchema,
  createUserSchema,
  updateUserSchema,
  getUserSchema,
} = require('../schemas/user.schema');

const router = express.Router();
const service = new UserService();
const propertyService = new PropertyService();

router.post('/register', validatorHandler(registerSchema, 'body'), async (req, res, next) => {
  try {
    const user = await service.register(req.body);
    const { token } = await service.login({
      email: req.body.email,
      password: req.body.password,
    });
    res.status(201).json({ ok: true, user, token });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validatorHandler(loginSchema, 'body'), async (req, res, next) => {
  try {
    const result = await service.login(req.body);
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authHandler, async (req, res, next) => {
  try {
    const user = await service.findOne(req.user.id);
    res.json({ ok: true, user });
  } catch (error) {
    next(error);
  }
});

router.get(
  '/me/properties',
  authHandler,
  validatorHandler(listPropertiesQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const properties = await propertyService.findMine(req.user.id, req.query);
      res.json({ ok: true, data: properties, count: properties.length });
    } catch (error) {
      next(error);
    }
  },
);

router.get('/', authHandler, requireRole('admin'), async (req, res, next) => {
  try {
    const users = await service.find();
    res.json({ ok: true, data: users });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  authHandler,
  requireRole('admin'),
  validatorHandler(createUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const user = await service.register(req.body);
      res.status(201).json({ ok: true, user });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/:id',
  authHandler,
  requireRole('admin'),
  validatorHandler(getUserSchema, 'params'),
  async (req, res, next) => {
    try {
      const user = await service.findOne(req.params.id);
      res.json({ ok: true, user });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/:id',
  authHandler,
  requireRole('admin'),
  validatorHandler(getUserSchema, 'params'),
  validatorHandler(updateUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const user = await service.update(req.params.id, req.body);
      res.json({ ok: true, user });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/:id',
  authHandler,
  requireRole('admin'),
  validatorHandler(getUserSchema, 'params'),
  async (req, res, next) => {
    try {
      const result = await service.delete(req.params.id);
      res.json({ ok: true, ...result });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
