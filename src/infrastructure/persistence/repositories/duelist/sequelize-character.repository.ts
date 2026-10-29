import { Op } from 'sequelize';
import { CharacterModel } from '../../models/character.model';
import { DeckModel } from '../../models/deck.model';
import { DeckCardModel } from '../../models/deck-card.model';
import { CardModel } from '../../models/card.model';
import { CharacterSandwichRatingModel } from '../../models/character-sandwich-rating.model';
import { CardCharacterObtentionModel } from '../../models/card-character-obtention.model';
import {
  Character,
  CharacterDecksPage,
  CharacterSearchFilters
} from '../../../../domain/duelist/entities/character.entity';
import { CharacterRepository } from '../../../../domain/duelist/repositories/character.repository.interface';

export class SequelizeCharacterRepository implements CharacterRepository {
  public async findAll(filters: CharacterSearchFilters): Promise<Character[]> {
    const where: Record<string, unknown> = {};
    if (filters.name) where.name = { [Op.like]: `%${filters.name}%` };
    if (filters.tier) where.tier = filters.tier;
    if (filters.category) where.category = filters.category;

    const rows = await CharacterModel.findAll({
      where,
      order: [
        ['tier', 'ASC'],
        ['category', 'ASC'],
        ['name', 'ASC']
      ]
    });

    return rows.map(
      row =>
        new Character({
          id: row.id,
          name: row.name,
          tier: row.tier,
          category: row.category,
          image: row.image
        })
    );
  }

  public async findByIdWithRelations(id: number): Promise<Record<string, unknown> | null> {
    const character = await CharacterModel.findByPk(id, {
      include: [
        {
          model: DeckModel,
          as: 'decks',
          include: [
            {
              model: DeckCardModel,
              as: 'cards',
              include: [
                {
                  model: CardModel,
                  as: 'card',
                  attributes: { exclude: ['clip_embedding'] }
                }
              ]
            }
          ]
        },
        {
          model: CharacterSandwichRatingModel,
          as: 'sandwichRatings'
        }
      ]
    });

    if (!character) {
      return null;
    }

    const victoryCards = await CardModel.findAll({
      include: [
        {
          model: CardCharacterObtentionModel,
          where: { characterId: id },
          required: true
        }
      ],
      attributes: { exclude: ['clip_embedding'] }
    });

    return {
      ...(character.toJSON() as Record<string, unknown>),
      victoryCards: victoryCards.map(card => card.toJSON())
    };
  }

  public async findDecksByCharacterId(
    characterId: number,
    limit?: number,
    offset = 0
  ): Promise<CharacterDecksPage | null> {
    const character = await CharacterModel.findByPk(characterId);
    if (!character) {
      return null;
    }

    const [decks, total] = await Promise.all([
      DeckModel.findAll({
        where: { characterId },
        include: [
          {
            model: DeckCardModel,
            as: 'cards',
            include: [
              {
                model: CardModel,
                as: 'card',
                attributes: { exclude: ['clip_embedding'] }
              }
            ]
          }
        ],
        limit,
        offset,
        order: [['name', 'ASC']]
      }),
      DeckModel.count({ where: { characterId } })
    ]);

    return {
      decks: decks.map(deck => deck.toJSON() as Record<string, unknown>),
      meta: {
        total,
        limit,
        offset,
        hasMore: limit !== undefined ? offset + limit < total : false
      }
    };
  }
}

