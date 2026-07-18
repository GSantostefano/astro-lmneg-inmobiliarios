const crypto = require('crypto');

function getRequestId(req) {
  const incoming = req.headers['x-request-id'];
  if (incoming && typeof incoming === 'string') {
    return incoming;
  }
  return crypto.randomUUID();
}

function requestContextHandler(req, res, next) {
  const requestId = getRequestId(req);
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  return next();
}

function requestLogger(req, res, next) {
  const startedAt = Date.now();
  res.on('finish', () => {
    const latencyMs = Date.now() - startedAt;
    const path = req.originalUrl || req.url || '';
    const onlyErrors = process.env.LOG_HTTP_ONLY_ERRORS === '1';
    const isError = res.statusCode >= 500;
    if (onlyErrors && !isError) return;

    console.log(
      JSON.stringify({
        level: 'info',
        event: 'http_request',
        requestId: req.requestId,
        method: req.method,
        path,
        statusCode: res.statusCode,
        latencyMs,
      }),
    );
  });
  return next();
}

module.exports = { requestContextHandler, requestLogger };
