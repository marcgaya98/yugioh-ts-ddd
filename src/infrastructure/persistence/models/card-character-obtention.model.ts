import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export class CardCharacterObtentionModel extends Model {
  declare cardId: number;
  declare characterId: number;
  declare requiredTrust: boolean;
  declare quantity: number;
}

CardCharacterObtentionModel.init(
  {
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    characterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    requiredTrust: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    sequelize,
    modelName: 'card_character_obtention',
    tableName: 'card_character_obtention',
    timestamps: false
  }
);

