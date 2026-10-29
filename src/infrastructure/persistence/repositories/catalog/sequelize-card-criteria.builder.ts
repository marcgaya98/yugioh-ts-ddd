import { Op, Includeable, Order, WhereOptions } from 'sequelize';
import {
  CardSearchCriteria,
  MonsterFilterCriteria,
  NumericRangeFilter
} from '../../../../domain/catalog/value-objects/card-search-criteria.value-object';
import { MonsterCardModel } from '../../models/monster-card.model';
import { SpellCardModel } from '../../models/spell-card.model';
import { TrapCardModel } from '../../models/trap-card.model';

const CARD_DIRECT_SORT_FIELDS = ['name', 'archetype', 'code', 'alter_name', 'password', 'rarity'];
const MONSTER_SORT_FIELDS = ['attack', 'defense', 'level'];

export class SequelizeCardCriteriaBuilder {
  public static buildWhereClause(criteria: CardSearchCriteria): WhereOptions {
    const where: Record<string, unknown> = {};

    if (criteria.name) where.name = { [Op.like]: `%${criteria.name}%` };
    if (criteria.code) where.code = criteria.code;
    if (criteria.rarity) where.rarity = this.toSingleOrInClause(criteria.rarity);
    if (criteria.frame) where.frame = this.toSingleOrInClause(criteria.frame);
    if (criteria.archetype) where.archetype = this.toSingleOrInClause(criteria.archetype);
    if (criteria.cardType) where.cardType = this.toSingleOrInClause(criteria.cardType);
    if (criteria.alterName) where.alter_name = { [Op.like]: `%${criteria.alterName}%` };
    if (criteria.password) where.password = criteria.password;
    if (criteria.restrictedCardIds !== undefined) {
      where.id = { [Op.in]: criteria.restrictedCardIds };
    }

    return where;
  }

  public static buildIncludes(criteria: CardSearchCriteria): Includeable[] {
    return [
      this.buildMonsterInclude(criteria.monsterFilters),
      this.buildSpellInclude(criteria.spellType),
      this.buildTrapInclude(criteria.trapType)
    ];
  }

  public static buildOrder(criteria: CardSearchCriteria): Order {
    const { sortBy, sortOrder } = criteria;

    if (CARD_DIRECT_SORT_FIELDS.includes(sortBy)) {
      return [[sortBy, sortOrder]];
    }

    if (MONSTER_SORT_FIELDS.includes(sortBy)) {
      return [[{ model: MonsterCardModel, as: 'monsterData' }, sortBy, sortOrder]];
    }

    return [['name', 'ASC']];
  }

  private static buildMonsterInclude(filters: MonsterFilterCriteria): Includeable {
    const where: Record<string, unknown> = {};

    if (filters.attribute) where.attribute = this.toSingleOrInClause(filters.attribute);
    if (filters.effectTrait !== undefined) where.effectTrait = filters.effectTrait;
    if (filters.summonMechanic) where.summonMechanic = filters.summonMechanic;
    if (filters.ability) where.ability = this.toSingleOrInClause(filters.ability);
    if (filters.type) where.type = this.toSingleOrInClause(filters.type);
    if (filters.level) where.level = this.buildRangeCondition(filters.level);
    if (filters.attack) where.attack = this.buildRangeCondition(filters.attack);
    if (filters.defense) where.defense = this.buildRangeCondition(filters.defense);

    const hasFilters = Object.keys(where).length > 0;
    return {
      model: MonsterCardModel,
      as: 'monsterData',
      ...(hasFilters ? { where, required: true } : { required: false })
    };
  }

  private static buildSpellInclude(spellType?: string[]): Includeable {
    if (spellType && spellType.length > 0) {
      return {
        model: SpellCardModel,
        as: 'spellData',
        where: { type: this.toSingleOrInClause(spellType) },
        required: true
      };
    }

    return { model: SpellCardModel, as: 'spellData', required: false };
  }

  private static buildTrapInclude(trapType?: string[]): Includeable {
    if (trapType && trapType.length > 0) {
      return {
        model: TrapCardModel,
        as: 'trapData',
        where: { type: this.toSingleOrInClause(trapType) },
        required: true
      };
    }

    return { model: TrapCardModel, as: 'trapData', required: false };
  }

  private static buildRangeCondition(range: NumericRangeFilter): unknown {
    const condition: Record<symbol, unknown> = {};
    if (range.exact && range.exact.length > 0) {
      if (range.min === undefined && range.max === undefined) {
        return this.toSingleOrInClause(range.exact);
      }
      condition[Op.in] = range.exact;
    }
    if (range.min !== undefined) condition[Op.gte] = range.min;
    if (range.max !== undefined) condition[Op.lte] = range.max;
    return condition;
  }

  private static toSingleOrInClause<T>(values: T[]): T | { [Op.in]: T[] } {
    return values.length === 1 ? values[0] : { [Op.in]: values };
  }
}

