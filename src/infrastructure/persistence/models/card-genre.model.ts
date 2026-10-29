import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export class CardGenreModel extends Model {
  declare cardId: number;
  declare genreId: number;
}

CardGenreModel.init(
  {
    cardId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    genreId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  },
  {
    sequelize,
    modelName: 'CardGenre',
    tableName: 'card_genres',
    timestamps: false
  }
);

