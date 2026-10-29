import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export class CardInitialDeckModel extends Model {
  declare cardId: number;
  declare quantity: number;
}

CardInitialDeckModel.init(
  {
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    sequelize,
    modelName: 'card_initial_deck',
    tableName: 'card_initial_deck',
    timestamps: false
  }
);

