import { Op } from 'sequelize';
import { sequelize } from '../../../config/database.config';
import { CardModel } from '../../models/card.model';
import { CardGenreModel } from '../../models/card-genre.model';
import { GenreModel } from '../../models/genre.model';
import { MonsterCardModel, MONSTER_TYPE_VALUES } from '../../models/monster-card.model';
import { SpellCardModel } from '../../models/spell-card.model';
import { TrapCardModel } from '../../models/trap-card.model';
import { Card } from '../../../../domain/catalog/entities/card.entity';
import { Genre } from '../../../../domain/catalog/entities/genre.entity';
import { CardSearchCriteria } from '../../../../domain/catalog/value-objects/card-search-criteria.value-object';
import {
  CardRepository,
  CardQueryResult
} from '../../../../domain/catalog/repositories/card.repository.interface';
import { SequelizeCardCriteriaBuilder } from './sequelize-card-criteria.builder';

const EXCLUDED_EMBEDDING_ATTRIBUTES = ['clip_embedding'];

export class SequelizeCardRepository implements CardRepository {
  public async searchWithCriteria(criteria: CardSearchCriteria): Promise<CardQueryResult> {
    const effectiveCriteria = await this.resolveGenreFilteredCriteria(criteria);
    const { rows, count } = await CardModel.findAndCountAll({
      where: SequelizeCardCriteriaBuilder.buildWhereClause(effectiveCriteria),
      include: SequelizeCardCriteriaBuilder.buildIncludes(effectiveCriteria),
      order: SequelizeCardCriteriaBuilder.buildOrder(effectiveCriteria),
      limit: effectiveCriteria.pagination.pageSize,
      offset: effectiveCriteria.pagination.offset,
      distinct: true,
      subQuery: false,
      attributes: { exclude: EXCLUDED_EMBEDDING_ATTRIBUTES }
    });

    const genresByCardId = await this.fetchGenresByCardIds(rows.map(row => row.id));

    return {
      cards: rows.map(row => this.mapRowToDomain(row, genresByCardId.get(row.id))),
      totalCount: count
    };
  }

  private async resolveGenreFilteredCriteria(
    criteria: CardSearchCriteria
  ): Promise<CardSearchCriteria> {
    if (!criteria.genres || criteria.genres.length === 0) {
      return criteria;
    }

    const genreRows = await CardGenreModel.findAll({
      where: { genreId: { [Op.in]: criteria.genres } },
      attributes: ['cardId']
    });
    const genreCardIds = Array.from(new Set(genreRows.map(row => row.cardId)));
    const combinedIds = criteria.restrictedCardIds
      ? criteria.restrictedCardIds.filter(id => genreCardIds.includes(id))
      : genreCardIds;

    return { ...criteria, restrictedCardIds: combinedIds };
  }

  private async fetchGenresByCardIds(cardIds: number[]): Promise<Map<number, Genre[]>> {
    const genresMap = new Map<number, Genre[]>();
    if (cardIds.length === 0) {
      return genresMap;
    }

    const cardsWithGenres = await CardModel.findAll({
      where: { id: { [Op.in]: cardIds } },
      attributes: ['id'],
      include: [{ model: GenreModel, as: 'genres', through: { attributes: [] } }]
    });

    for (const cardRow of cardsWithGenres) {
      const plain = cardRow.toJSON() as Record<string, any>;
      const genres = Array.isArray(plain.genres)
        ? plain.genres.map(
            (g: { id: number; name: string; category: string }) =>
              new Genre({ id: g.id, name: g.name, category: g.category })
          )
        : [];
      genresMap.set(plain.id, genres);
    }

    return genresMap;
  }

  public async findByIdWithDetails(id: number): Promise<Card | null> {
    const row = await CardModel.findOne({
      where: { id },
      include: [
        { model: GenreModel, as: 'genres', through: { attributes: [] } },
        { model: MonsterCardModel, as: 'monsterData' },
        { model: SpellCardModel, as: 'spellData', attributes: ['type'] },
        { model: TrapCardModel, as: 'trapData', attributes: ['type'] }
      ],
      attributes: { exclude: EXCLUDED_EMBEDDING_ATTRIBUTES }
    });

    return row ? this.mapRowToDomain(row) : null;
  }

  public async findDistinctArchetypes(): Promise<string[]> {
    const rows = await CardModel.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('archetype')), 'archetype']],
      where: {
        archetype: { [Op.ne]: null }
      },
      order: [['archetype', 'ASC']]
    });

    return rows
      .map(row => row.archetype)
      .filter((archetype): archetype is string => Boolean(archetype && archetype.trim() !== ''));
  }

  public getMonsterTypeValues(): string[] {
    return [...MONSTER_TYPE_VALUES];
  }

  private mapRowToDomain(row: CardModel, preloadedGenres?: Genre[]): Card {
    const plain = row.toJSON() as Record<string, any>;
    const genres =
      preloadedGenres ??
      (Array.isArray(plain.genres)
        ? plain.genres.map(
            (g: { id: number; name: string; category: string }) =>
              new Genre({ id: g.id, name: g.name, category: g.category })
          )
        : []);

    return new Card({
      id: plain.id,
      name: plain.name,
      code: plain.code,
      description: plain.description,
      imageUrl: plain.image_url ?? null,
      password: plain.password ?? null,
      rarity: plain.rarity,
      frame: plain.frame,
      archetype: plain.archetype ?? null,
      cardType: plain.cardType,
      alterName: plain.alter_name ?? null,
      genres,
      monsterData: plain.monsterData ?? null,
      spellData: plain.spellData ?? null,
      trapData: plain.trapData ?? null
    });
  }
}

