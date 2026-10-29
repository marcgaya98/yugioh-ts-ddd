import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export const CHARACTER_TIER_VALUES = [
  'Tier 1', 'Tier 2', 'Tier 3', 'Non Duelist'
] as const;

export const CHARACTER_CATEGORY_VALUES = [
  'Teachers',
  'Slifer Red',
  'Ra Yellow',
  'Obelisk Blue boys',
  'Obelisk Blue girls',
  'Charisma'
] as const;

export class CharacterModel extends Model {
  declare id: number;
  declare name: string;
  declare tier: (typeof CHARACTER_TIER_VALUES)[number];
  declare category: (typeof CHARACTER_CATEGORY_VALUES)[number] | null;
  declare image: string | null;
}

CharacterModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tier: {
      type: DataTypes.ENUM(...CHARACTER_TIER_VALUES),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM(...CHARACTER_CATEGORY_VALUES),
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Character',
    tableName: 'character',
    timestamps: false
  }
);

