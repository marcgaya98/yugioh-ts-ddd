import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export class CardSandwichObtentionModel extends Model {
  declare id: number;
  declare card_id: number;
}

CardSandwichObtentionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    card_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  },
  {
    sequelize,
    modelName: 'card_sandwich_obtention',
    tableName: 'card_sandwich_obtention',
    timestamps: false
  }
);

