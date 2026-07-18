const express = require('express');
const AuthService = require('../services/auth.service');
const validatorHandler = require('../middlewares/validator.handler');
const { googleAuthSchema } = require('../schemas/auth.schema');

const router = express.Router();
const service = new AuthService();

router.post('/google', validatorHandler(googleAuthSchema, 'body'), async (req, res, next) => {
  try {
    const result = await service.loginWithGoogle(req.body.credential);
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
