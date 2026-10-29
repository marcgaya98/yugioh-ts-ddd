import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export const ICON_CATEGORY_VALUES = [
  'attribute',
  'type',
  'frame',
  'property',
  'mechanic',
  'gameplay'
] as const;

export class IconModel extends Model {
  declare id: number;
  declare category: (typeof ICON_CATEGORY_VALUES)[number];
  declare key: string;
  declare name: string;
  declare icon_path: string;
  declare color_hex: string | null;
  declare description: string | null;
}

IconModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category: {
      type: DataTypes.ENUM(...ICON_CATEGORY_VALUES),
      allowNull: false
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    icon_path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color_hex: {
      type: DataTypes.STRING(7),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'icon',
    tableName: 'icons',
    timestamps: false
  }
);

