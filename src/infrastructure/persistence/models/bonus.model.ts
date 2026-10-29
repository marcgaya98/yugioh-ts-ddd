import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export const BONUS_CATEGORY_VALUES = [
  'victory', 'gameplay', 'special_summon', 'special_card', 'other'
] as const;

export class BonusModel extends Model {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare dpValue: string | null;
  declare category: (typeof BONUS_CATEGORY_VALUES)[number];
  declare conditions: string | null;
}

BonusModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dpValue: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM(...BONUS_CATEGORY_VALUES),
      allowNull: false
    },
    conditions: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'bonus',
    tableName: 'bonuses',
    timestamps: false
  }
);

