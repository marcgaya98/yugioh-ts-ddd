import { Op } from 'sequelize';
import { DeckModel } from '../../models/deck.model';
import { DeckCardModel } from '../../models/deck-card.model';
import { CardModel } from '../../models/card.model';
import { CharacterModel } from '../../models/character.model';
import { Deck, DeckSearchFilters } from '../../../../domain/duelist/entities/deck.entity';
import { DeckRepository } from '../../../../domain/duelist/repositories/deck.repository.interface';

export class SequelizeDeckRepository implements DeckRepository {
  public async findAll(filters: DeckSearchFilters): Promise<Deck[]> {
    const where: Record<string, unknown> = {};
    if (filters.name) where.name = { [Op.like]: `%${filters.name}%` };
    if (filters.level !== undefined) where.level = filters.level;
    if (filters.characterId !== undefined) where.characterId = filters.characterId;

    const rows = await DeckModel.findAll({
      where,
      include: [
        {
          model: CharacterModel,
          as: 'owner',
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });

    return rows.map(row => {
      const plain = row.toJSON() as Record<string, any>;
      return new Deck({
        id: plain.id,
        name: plain.name,
        level: plain.level,
        characterId: plain.characterId,
        extraDeck: plain.extraDeck,
        owner: plain.owner ?? null
      });
    });
  }

  public async findByIdWithDetails(id: string): Promise<Record<string, unknown> | null> {
    const row = await DeckModel.findByPk(id, {
      include: [
        {
          model: DeckCardModel,
          as: 'cards',
          attributes: ['deckId', 'cardId', 'section', 'count'],
          include: [
            {
              model: CardModel,
              as: 'card',
              attributes: ['id', 'name', 'description', 'image_url']
            }
          ]
        },
        {
          model: CharacterModel,
          as: 'owner',
          attributes: ['id', 'name', 'tier']
        }
      ]
    });

    return row ? (row.toJSON() as Record<string, unknown>) : null;
  }

  public async findCardsByDeckId(id: string): Promise<Record<string, unknown>[] | null> {
    const row = await DeckModel.findByPk(id, {
      include: [
        {
          model: DeckCardModel,
          as: 'cards',
          attributes: ['deckId', 'cardId', 'section', 'count'],
          include: [
            {
              model: CardModel,
              as: 'card',
              attributes: ['id', 'name', 'description', 'image_url']
            }
          ]
        }
      ]
    });

    if (!row) {
      return null;
    }

    const plain = row.toJSON() as Record<string, any>;
    const deckCards = Array.isArray(plain.cards) ? plain.cards : [];

    return deckCards.map((entry: any) => ({
      ...(entry.card ?? {}),
      quantity: entry.count
    }));
  }
}

