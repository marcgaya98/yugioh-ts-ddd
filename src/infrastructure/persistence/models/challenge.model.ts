import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export const CHALLENGE_CATEGORY_VALUES = [
  'victory',
  'damage',
  'monster_related',
  'summoning',
  'spell_trap',
  'deck_building',
  'special_condition'
] as const;

export class ChallengeModel extends Model {
  declare id: number;
  declare name: string;
  declare description: string;
  declare category: (typeof CHALLENGE_CATEGORY_VALUES)[number];
  declare difficulty: number | null;
}

ChallengeModel.init(
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
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM(...CHALLENGE_CATEGORY_VALUES),
      allowNull: false
    },
    difficulty: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'challenge',
    tableName: 'challenges',
    timestamps: false
  }
);

