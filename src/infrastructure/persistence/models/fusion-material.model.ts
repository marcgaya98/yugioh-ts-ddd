import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export class FusionMaterialModel extends Model {
  declare fusionId: number;
  declare materialId: number;
}

FusionMaterialModel.init(
  {
    fusionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  },
  {
    sequelize,
    modelName: 'fusion_material',
    tableName: 'fusion_material',
    timestamps: false
  }
);

