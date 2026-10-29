import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export class PackModel extends Model {
  declare id: number;
  declare name: string;
  declare price: number;
  declare image_url: string;
  declare unlock_methods: string | null;
  declare card_count: number | null;
  declare total_cards: number | null;
  declare description: string | null;
  declare description_extra: string | null;
  declare cover_card: string | null;
}

PackModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    unlock_methods: {
      type: DataTypes.STRING,
      allowNull: true
    },
    card_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_cards: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description_extra: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cover_card: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Pack',
    tableName: 'pack',
    timestamps: false
  }
);

