import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export const MONSTER_ATTRIBUTE_VALUES = [
  'DARK', 'DIVINE', 'EARTH', 'FIRE', 'LIGHT', 'WATER', 'WIND'
] as const;

export const MONSTER_TYPE_VALUES = [
  'Aqua', 'Beast', 'Beast-Warrior', 'Dinosaur', 'Divine-Beast',
  'Dragon', 'Fairy', 'Fiend', 'Fish', 'Illusion', 'Insect',
  'Machine', 'Plant', 'Pyro', 'Reptile', 'Rock', 'Sea Serpent',
  'Spellcaster', 'Thunder', 'Warrior', 'Winged Beast', 'Zombie'
] as const;

export const MONSTER_SUMMON_MECHANIC_VALUES = ['Ritual', 'Fusion'] as const;
export const MONSTER_ABILITY_VALUES = ['Flip', 'Toon', 'Spirit', 'Union'] as const;

export class MonsterCardModel extends Model {
  declare cardId: number;
  declare attribute: (typeof MONSTER_ATTRIBUTE_VALUES)[number];
  declare effectTrait: boolean;
  declare summonMechanic: (typeof MONSTER_SUMMON_MECHANIC_VALUES)[number] | null;
  declare ability: (typeof MONSTER_ABILITY_VALUES)[number] | null;
  declare type: (typeof MONSTER_TYPE_VALUES)[number];
  declare level: number;
  declare attack: number | null;
  declare defense: number | null;
}

MonsterCardModel.init(
  {
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true
    },
    attribute: {
      type: DataTypes.ENUM(...MONSTER_ATTRIBUTE_VALUES),
      allowNull: false
    },
    effectTrait: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    summonMechanic: {
      type: DataTypes.ENUM(...MONSTER_SUMMON_MECHANIC_VALUES),
      allowNull: true
    },
    ability: {
      type: DataTypes.ENUM(...MONSTER_ABILITY_VALUES),
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM(...MONSTER_TYPE_VALUES),
      allowNull: false
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    attack: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    defense: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'MonsterCard',
    tableName: 'monster_card',
    timestamps: false
  }
);
