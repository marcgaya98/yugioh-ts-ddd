import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export const GENRE_CATEGORY_VALUES = [
  'Destruction',
  'Monster categories',
  'Disruption',
  'Support',
  'Hand',
  'Battle',
  'Life Points',
  'Items',
  'Summoning',
  'Misc'
] as const;

export class GenreModel extends Model {
  declare id: number;
  declare name: string;
  declare category: (typeof GENRE_CATEGORY_VALUES)[number];
}

GenreModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    category: {
      type: DataTypes.ENUM(...GENRE_CATEGORY_VALUES),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Genre',
    tableName: 'genres',
    timestamps: false
  }
);

