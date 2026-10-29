import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export class CharacterSandwichRatingModel extends Model {
  declare id: number;
  declare characterId: number;
  declare sandwich: string | null;
  declare rating: number | null;
  declare response: string | null;
}

CharacterSandwichRatingModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    characterId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sandwich: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    rating: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'CharacterSandwichRating',
    tableName: 'character_sandwich_rating',
    timestamps: false
  }
);

