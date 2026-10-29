import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export class DeckModel extends Model {
  declare id: string;
  declare name: string;
  declare level: number;
  declare characterId: number | null;
  declare extraDeck: boolean;
}

DeckModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    characterId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    extraDeck: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'Deck',
    tableName: 'deck',
    timestamps: false
  }
);

