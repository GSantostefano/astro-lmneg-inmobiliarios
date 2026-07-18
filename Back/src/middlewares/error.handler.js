const { ValidationError } = require('sequelize');

function logErrors(err, req, res, next) {
  console.error(
    JSON.stringify({
      level: 'error',
      event: 'http_error',
      requestId: req.requestId,
      message: err?.message,
      stack: err?.stack,
    }),
  );
  next(err);
}

function buildErrorResponse({ statusCode, code, message, details, stack, requestId }) {
  return {
    ok: false,
    statusCode,
    code,
    message,
    details: details || undefined,
    stack: stack || undefined,
    requestId: requestId || undefined,
  };
}

function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === 'production';
  return res.status(500).json(
    buildErrorResponse({
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: err?.message || 'Internal server error',
      stack: isProduction ? undefined : err?.stack,
      requestId: req.requestId,
    }),
  );
}

function boomErrorHandler(err, req, res, next) {
  if (err.isBoom) {
    const { output } = err;
    return res.status(output.statusCode).json(
      buildErrorResponse({
        statusCode: output.statusCode,
        code: output.payload?.error || 'BOOM_ERROR',
        message: output.payload?.message || 'Request error',
        requestId: req.requestId,
      }),
    );
  }
  return next(err);
}

function ormErrorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(409).json(
      buildErrorResponse({
        statusCode: 409,
        code: 'ORM_VALIDATION_ERROR',
        message: err.name,
        details: err.errors,
        requestId: req.requestId,
      }),
    );
  }
  return next(err);
}

module.exports = { logErrors, errorHandler, boomErrorHandler, ormErrorHandler };
