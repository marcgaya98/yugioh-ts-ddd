import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export const DECK_SECTION_VALUES = ['main', 'fusion', 'extra'] as const;

export class DeckCardModel extends Model {
  declare id?: number;
  declare deckId: string;
  declare cardId: number;
  declare section: (typeof DECK_SECTION_VALUES)[number];
  declare count: number;
}

DeckCardModel.init(
  {
    deckId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    section: {
      type: DataTypes.ENUM(...DECK_SECTION_VALUES),
      allowNull: false
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    sequelize,
    modelName: 'DeckCard',
    tableName: 'deck_card',
    timestamps: false
  }
);

