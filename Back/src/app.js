const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routerApi = require('./routes');
const { UPLOAD_ROOT } = require('./middlewares/upload.handler');
const { requestContextHandler, requestLogger } = require('./middlewares/requestContext.handler');
const {
  logErrors,
  ormErrorHandler,
  boomErrorHandler,
  errorHandler,
} = require('./middlewares/error.handler');

const app = express();
app.set('trust proxy', 1);

const whitelist = String(process.env.CORS_ORIGINS || 'http://localhost:4321,http://127.0.0.1:4321')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

function isCloudflareFrontOrigin(origin) {
  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== 'https:') return false;
    if (hostname.includes('lmneg') && hostname.endsWith('.workers.dev')) return true;
    if (hostname === 'lmneginmobiliarios.com.ar') return true;
    if (hostname.endsWith('.lmneginmobiliarios.pages.dev')) return true;
    if (hostname.endsWith('.pages.dev') && hostname.includes('lmneg')) return true;
    return false;
  } catch {
    return false;
  }
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.includes(origin) || isCloudflareFrontOrigin(origin)) {
      callback(null, true);
      return;
    }
    if (
      process.env.NODE_ENV !== 'production' &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
};

app.use(requestContextHandler);
app.use(requestLogger);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(
  '/uploads',
  express.static(UPLOAD_ROOT, {
    maxAge: '7d',
    fallthrough: false,
  }),
);

app.get('/health', (req, res) => {
  return res.status(200).json({
    ok: true,
    service: 'lmneg-inmobiliarios-back',
    status: 'healthy',
    uptimeSec: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'LM Negocios Inmobiliarios API',
    docs: '/api',
  });
});

routerApi(app);

app.use(logErrors);
app.use(ormErrorHandler);
app.use(boomErrorHandler);
app.use(errorHandler);

module.exports = app;
