import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export const TUTORIAL_DAY_VALUES = [
  'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
] as const;

export class CardTutorialObtentionModel extends Model {
  declare cardId: number;
  declare day: (typeof TUTORIAL_DAY_VALUES)[number];
}

CardTutorialObtentionModel.init(
  {
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    day: {
      type: DataTypes.ENUM(...TUTORIAL_DAY_VALUES),
      allowNull: false,
      primaryKey: true
    }
  },
  {
    sequelize,
    modelName: 'card_tutorial_obtention',
    tableName: 'card_tutorial_obtention',
    timestamps: false
  }
);

