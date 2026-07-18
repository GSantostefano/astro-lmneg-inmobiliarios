const rateLimit = require('express-rate-limit');

function createLimiter({ windowMs, max, code }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      statusCode: 429,
      code,
      message: 'Too many requests, try again later.',
    },
  });
}

const defaultApiLimiter = createLimiter({
  windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS || 60 * 1000),
  max: Number(process.env.API_RATE_LIMIT_MAX_REQUESTS || 240),
  code: 'RATE_LIMIT_EXCEEDED_DEFAULT',
});

const authApiLimiter = createLimiter({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 60 * 1000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || 30),
  code: 'RATE_LIMIT_EXCEEDED_AUTH',
});

module.exports = {
  defaultApiLimiter,
  authApiLimiter,
};
