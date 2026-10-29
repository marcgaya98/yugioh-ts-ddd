import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export const TRAP_TYPE_VALUES = ['Normal', 'Continuous', 'Counter'] as const;

export class TrapCardModel extends Model {
  declare cardId: number;
  declare type: (typeof TRAP_TYPE_VALUES)[number];
}

TrapCardModel.init(
  {
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true
    },
    type: {
      type: DataTypes.ENUM(...TRAP_TYPE_VALUES),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'TrapCard',
    tableName: 'trap_card',
    timestamps: false
  }
);
