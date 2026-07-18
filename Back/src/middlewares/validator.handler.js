const boom = require('@hapi/boom');

function validatorHandler(schema, property) {
  return (req, res, next) => {
    const data = req[property];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return next(boom.badRequest(error));
    }
    req[property] = value;
    return next();
  };
}

module.exports = validatorHandler;
