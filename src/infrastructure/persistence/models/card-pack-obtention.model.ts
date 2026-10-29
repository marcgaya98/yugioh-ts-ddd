import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export class CardPackObtentionModel extends Model {
  declare cardId: number;
  declare packId: number;
}

CardPackObtentionModel.init(
  {
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    packId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  },
  {
    sequelize,
    modelName: 'card_pack_obtention',
    tableName: 'card_pack_obtention',
    timestamps: false
  }
);

