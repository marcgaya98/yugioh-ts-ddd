import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.config';

export class CardModel extends Model {
  declare id: number;
  declare name: string;
  declare code: string;
  declare description: string;
  declare image_url: string;
  declare password: string | null;
  declare rarity: 'ultra' | 'super' | 'rare' | 'common';
  declare frame: 'normal' | 'effect' | 'fusion' | 'ritual' | 'spell' | 'trap' | 'token';
  declare archetype: string | null;
  declare cardType: 'Monster' | 'Spell' | 'Trap';
  declare alter_name: string | null;
  declare clip_embedding: unknown;
}

CardModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rarity: {
      type: DataTypes.ENUM('ultra', 'super', 'rare', 'common'),
      allowNull: false
    },
    frame: {
      type: DataTypes.ENUM('normal', 'effect', 'fusion', 'ritual', 'spell', 'trap', 'token'),
      allowNull: false
    },
    archetype: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cardType: {
      type: DataTypes.ENUM('Monster', 'Spell', 'Trap'),
      allowNull: false
    },
    alter_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clip_embedding: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      get() {
        const raw = this.getDataValue('clip_embedding');
        if (!raw) return null;
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      },
      set(val: unknown) {
        this.setDataValue('clip_embedding', val ? JSON.stringify(val) : null);
      }
    }
  },
  {
    sequelize,
    modelName: 'Card',
    tableName: 'card',
    timestamps: false
  }
);
