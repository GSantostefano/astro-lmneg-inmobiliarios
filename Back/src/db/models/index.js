const { User, UserSchema } = require('./user.model');
const { Property, PropertySchema } = require('./property.model');

function setupModels(sequelize) {
  User.init(UserSchema, User.config(sequelize));
  Property.init(PropertySchema, Property.config(sequelize));

  const m = sequelize.models;
  User.associate(m);
  Property.associate(m);
}

module.exports = setupModels;
