import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export const LIMIT_STATUS_VALUES = [
  'forbidden',
  'limited',
  'semi-limited',
  'unlimited'
] as const;

export class CardLimitListModel extends Model {
  declare id: number;
  declare cardId: number;
  declare listName: string;
  declare status: (typeof LIMIT_STATUS_VALUES)[number];
  declare limit: number;
  declare effectiveDate: Date | null;
}

CardLimitListModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'card_id'
    },
    listName: {
      type: DataTypes.STRING(128),
      allowNull: false,
      field: 'list_name'
    },
    status: {
      type: DataTypes.ENUM(...LIMIT_STATUS_VALUES),
      allowNull: false
    },
    limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'limit_value'
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'effective_date'
    }
  },
  {
    sequelize,
    modelName: 'CardLimitList',
    tableName: 'card_limit_list',
    timestamps: false
  }
);

