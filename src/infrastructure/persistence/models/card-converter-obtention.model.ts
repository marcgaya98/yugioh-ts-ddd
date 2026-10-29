import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export class CardConverterObtentionModel extends Model {
  declare cardId: number;
  declare cardsRequired: number;
}

CardConverterObtentionModel.init(
  {
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cardsRequired: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  },
  {
    sequelize,
    modelName: 'card_converter_obtention',
    tableName: 'card_converter_obtention',
    timestamps: false
  }
);

