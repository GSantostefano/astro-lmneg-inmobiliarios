const { Model, DataTypes, Sequelize } = require('sequelize');

const PROPERTY_TABLE = 'properties';

const PropertySchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  slug: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
  title: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  operation: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  type: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  status: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'disponible',
  },
  price: {
    allowNull: false,
    type: DataTypes.DECIMAL(14, 2),
    get() {
      const raw = this.getDataValue('price');
      return raw === null || raw === undefined ? 0 : Number(raw);
    },
  },
  currency: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'USD',
  },
  neighborhood: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  city: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  address: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  latitude: {
    allowNull: true,
    type: DataTypes.DECIMAL(10, 7),
    get() {
      const raw = this.getDataValue('latitude');
      return raw === null || raw === undefined ? null : Number(raw);
    },
  },
  longitude: {
    allowNull: true,
    type: DataTypes.DECIMAL(10, 7),
    get() {
      const raw = this.getDataValue('longitude');
      return raw === null || raw === undefined ? null : Number(raw);
    },
  },
  mapUrl: {
    allowNull: true,
    type: DataTypes.STRING,
    field: 'map_url',
  },
  coveredM2: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'covered_m2',
    defaultValue: 0,
  },
  semiCoveredM2: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'semi_covered_m2',
    defaultValue: 0,
  },
  rooms: {
    allowNull: false,
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  bathrooms: {
    allowNull: false,
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  description: {
    allowNull: false,
    type: DataTypes.TEXT,
  },
  features: {
    allowNull: false,
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('features');
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    set(value) {
      this.setDataValue('features', JSON.stringify(Array.isArray(value) ? value : []));
    },
  },
  heroImage: {
    allowNull: true,
    type: DataTypes.STRING,
    field: 'hero_image',
    defaultValue: '/assets/property-placeholder.png',
  },
  galleryImages: {
    allowNull: false,
    type: DataTypes.TEXT,
    field: 'gallery_images',
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('galleryImages');
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    set(value) {
      this.setDataValue('galleryImages', JSON.stringify(Array.isArray(value) ? value : []));
    },
  },
  refCode: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
    field: 'ref_code',
  },
  tokkoId: {
    allowNull: true,
    type: DataTypes.STRING,
    field: 'tokko_id',
  },
  userId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'updated_at',
    defaultValue: Sequelize.NOW,
  },
};

class Property extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      as: 'owner',
      foreignKey: 'userId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PROPERTY_TABLE,
      modelName: 'Property',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };
  }
}

module.exports = { PROPERTY_TABLE, PropertySchema, Property };
