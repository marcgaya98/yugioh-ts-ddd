import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export class RitualMonsterSpellModel extends Model {
  declare ritualMonsterId: number;
  declare ritualSpellId: number;
}

RitualMonsterSpellModel.init(
  {
    ritualMonsterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ritualSpellId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  },
  {
    sequelize,
    modelName: 'RitualMonsterSpell',
    tableName: 'ritual_monster_spell',
    timestamps: false
  }
);

