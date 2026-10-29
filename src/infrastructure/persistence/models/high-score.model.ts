import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export const HIGH_SCORE_CATEGORY_VALUES = [
  'damage', 'summon', 'spell_trap', 'other'
] as const;

export class HighScoreModel extends Model {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare category: (typeof HIGH_SCORE_CATEGORY_VALUES)[number];
}

HighScoreModel.init(
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
    category: {
      type: DataTypes.ENUM(...HIGH_SCORE_CATEGORY_VALUES),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'high_score',
    tableName: 'high_scores',
    timestamps: false
  }
);

