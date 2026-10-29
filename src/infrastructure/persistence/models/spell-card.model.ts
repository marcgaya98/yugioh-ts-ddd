import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export const SPELL_TYPE_VALUES = [
  'Normal', 'Continuous', 'Equip', 'Field', 'Quick-Play', 'Ritual'
] as const;

export class SpellCardModel extends Model {
  declare cardId: number;
  declare type: (typeof SPELL_TYPE_VALUES)[number];
}

SpellCardModel.init(
  {
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true
    },
    type: {
      type: DataTypes.ENUM(...SPELL_TYPE_VALUES),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'SpellCard',
    tableName: 'spell_card',
    timestamps: false
  }
);
