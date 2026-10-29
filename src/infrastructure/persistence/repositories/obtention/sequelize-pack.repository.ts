import { PackModel } from '../../models/pack.model';
import { CardModel } from '../../models/card.model';
import { CardPackObtentionModel } from '../../models/card-pack-obtention.model';
import { Pack } from '../../../../domain/obtention/entities/pack.entity';
import { PackRepository } from '../../../../domain/obtention/repositories/pack.repository.interface';

export class SequelizePackRepository implements PackRepository {
  public async findAll(): Promise<Pack[]> {
    const rows = await PackModel.findAll({
      order: [['name', 'ASC']]
    });
    return rows.map(row => this.mapRowToDomain(row));
  }

  public async findById(id: number): Promise<Pack | null> {
    const row = await PackModel.findByPk(id);
    return row ? this.mapRowToDomain(row) : null;
  }

  public async findCardsByPackId(packId: number): Promise<Record<string, unknown>[]> {
    const rows = await CardModel.findAll({
      include: [
        {
          model: CardPackObtentionModel,
          where: { packId },
          required: true
        }
      ],
      attributes: { exclude: ['clip_embedding'] },
      order: [['name', 'ASC']]
    });

    return rows.map(row => row.toJSON() as Record<string, unknown>);
  }

  private mapRowToDomain(row: PackModel): Pack {
    return new Pack({
      id: row.id,
      name: row.name,
      price: row.price,
      image_url: row.image_url,
      unlock_methods: row.unlock_methods,
      card_count: row.card_count,
      total_cards: row.total_cards,
      description: row.description,
      description_extra: row.description_extra,
      cover_card: row.cover_card
    });
  }
}

