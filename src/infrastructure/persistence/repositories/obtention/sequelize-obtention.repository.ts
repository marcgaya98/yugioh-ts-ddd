import { Model, ModelStatic } from 'sequelize';
import { CardModel } from '../../models/card.model';
import { PackModel } from '../../models/pack.model';
import { CharacterModel } from '../../models/character.model';
import { CardPackObtentionModel } from '../../models/card-pack-obtention.model';
import { CardCharacterObtentionModel } from '../../models/card-character-obtention.model';
import { CardConverterObtentionModel } from '../../models/card-converter-obtention.model';
import { CardTutorialObtentionModel } from '../../models/card-tutorial-obtention.model';
import { CardInitialDeckModel } from '../../models/card-initial-deck.model';
import { CardSandwichObtentionModel } from '../../models/card-sandwich-obtention.model';
import {
  CanonicalObtentionMethod,
  CardAllObtentionMethodsResult,
  CardWithObtentionEntry,
  InitialDeckObtentionResult,
  ObtentionMethodCount,
  VALID_EXCLUSIVE_METHODS
} from '../../../../domain/obtention/entities/card-obtention.entity';
import { ObtentionRepository } from '../../../../domain/obtention/repositories/obtention.repository.interface';

interface MethodSourceConfig {
  model: ModelStatic<Model>;
  cardForeignKey: string;
}

const METHOD_SOURCE_MAP: Record<CanonicalObtentionMethod, MethodSourceConfig> = {
  pack: { model: CardPackObtentionModel, cardForeignKey: 'cardId' },
  victory: { model: CardCharacterObtentionModel, cardForeignKey: 'cardId' },
  converter: { model: CardConverterObtentionModel, cardForeignKey: 'cardId' },
  tutorial: { model: CardTutorialObtentionModel, cardForeignKey: 'cardId' },
  initial: { model: CardInitialDeckModel, cardForeignKey: 'cardId' },
  sandwich: { model: CardSandwichObtentionModel, cardForeignKey: 'card_id' }
};

export class SequelizeObtentionRepository implements ObtentionRepository {
  public async getAllMethodCounts(): Promise<ObtentionMethodCount[]> {
    const [
      packCount,
      characterCount,
      converterCount,
      tutorialCount,
      sandwichCount,
      initialDeckCount
    ] = await Promise.all([
      CardPackObtentionModel.count(),
      CardCharacterObtentionModel.count(),
      CardConverterObtentionModel.count(),
      CardTutorialObtentionModel.count(),
      CardSandwichObtentionModel.count(),
      CardInitialDeckModel.count()
    ]);

    return [
      { method: 'pack', count: packCount },
      { method: 'character', count: characterCount },
      { method: 'converter', count: converterCount },
      { method: 'tutorial', count: tutorialCount },
      { method: 'sandwich', count: sandwichCount },
      { method: 'initial_deck', count: initialDeckCount }
    ].filter(entry => entry.count > 0);
  }

  public async getConverterCards(): Promise<CardWithObtentionEntry[]> {
    const rows = await CardConverterObtentionModel.findAll({
      include: [{ model: CardModel, as: 'card', attributes: { exclude: ['clip_embedding'] } }],
      order: [[{ model: CardModel, as: 'card' }, 'name', 'ASC']]
    });

    return rows.map((row: any) => ({
      ...row.card.toJSON(),
      obtention: { cardsRequired: row.cardsRequired }
    }));
  }

  public async getPackCards(packId?: number): Promise<CardWithObtentionEntry[]> {
    const where = packId !== undefined ? { packId } : {};
    const rows = await CardPackObtentionModel.findAll({
      where,
      include: [
        { model: CardModel, as: 'card', attributes: { exclude: ['clip_embedding'] } },
        { model: PackModel, as: 'pack' }
      ],
      order: [[{ model: CardModel, as: 'card' }, 'name', 'ASC']]
    });

    return rows.map((row: any) => ({
      ...row.card.toJSON(),
      obtention: {
        packId: row.packId,
        packName: row.pack?.name || 'Pack desconocido'
      }
    }));
  }

  public async getCharacterCards(characterId?: number): Promise<CardWithObtentionEntry[]> {
    const where = characterId !== undefined ? { characterId } : {};
    const rows = await CardCharacterObtentionModel.findAll({
      where,
      include: [
        { model: CardModel, as: 'card', attributes: { exclude: ['clip_embedding'] } },
        { model: CharacterModel, as: 'character' }
      ],
      order: [[{ model: CardModel, as: 'card' }, 'name', 'ASC']]
    });

    return rows.map((row: any) => ({
      ...row.card.toJSON(),
      obtention: {
        characterId: row.characterId,
        characterName: row.character?.name || 'Personaje desconocido',
        requiredTrust: row.requiredTrust,
        quantity: row.quantity
      }
    }));
  }

  public async getTutorialCards(day?: string): Promise<CardWithObtentionEntry[]> {
    const where = day ? { day } : {};
    const rows = await CardTutorialObtentionModel.findAll({
      where,
      include: [{ model: CardModel, as: 'card', attributes: { exclude: ['clip_embedding'] } }],
      order: [[{ model: CardModel, as: 'card' }, 'name', 'ASC']]
    });

    return rows.map((row: any) => ({
      ...row.card.toJSON(),
      obtention: { day: row.day }
    }));
  }

  public async getInitialDeckCards(): Promise<InitialDeckObtentionResult> {
    const rows = await CardInitialDeckModel.findAll({
      include: [{ model: CardModel, as: 'card', attributes: { exclude: ['clip_embedding'] } }],
      order: [[{ model: CardModel, as: 'card' }, 'name', 'ASC']]
    });

    const cards = rows.map((row: any) => ({
      ...row.card.toJSON(),
      obtention: { quantity: row.quantity }
    }));

    const totalCards = rows.reduce((sum, row) => sum + row.quantity, 0);
    return {
      cards,
      meta: { total: cards.length, totalCards }
    };
  }

  public async getSandwichCards(): Promise<CardWithObtentionEntry[]> {
    const rows = await CardSandwichObtentionModel.findAll({
      include: [{ model: CardModel, as: 'card', attributes: { exclude: ['clip_embedding'] } }],
      order: [[{ model: CardModel, as: 'card' }, 'name', 'ASC']]
    });

    return rows.map((row: any) => ({
      ...row.card.toJSON(),
      obtention: { method: 'sandwich' }
    }));
  }

  public async getCardIdsByAllMethods(): Promise<Map<CanonicalObtentionMethod, Set<number>>> {
    const cardIdsByMethod = new Map<CanonicalObtentionMethod, Set<number>>();

    for (const method of VALID_EXCLUSIVE_METHODS) {
      const { model, cardForeignKey } = METHOD_SOURCE_MAP[method];
      const rows = (await model.findAll({
        attributes: [cardForeignKey],
        raw: true
      })) as unknown as Record<string, number>[];

      cardIdsByMethod.set(method, new Set(rows.map(row => row[cardForeignKey])));
    }

    return cardIdsByMethod;
  }

  public async getCardsForExclusiveIds(
    method: CanonicalObtentionMethod,
    cardIds: number[]
  ): Promise<CardWithObtentionEntry[]> {
    const { model, cardForeignKey } = METHOD_SOURCE_MAP[method];
    const rows = await model.findAll({
      where: { [cardForeignKey]: cardIds },
      include: [{ model: CardModel, as: 'card', attributes: { exclude: ['clip_embedding'] } }],
      order: [[{ model: CardModel, as: 'card' }, 'name', 'ASC']]
    });

    return rows.map((row: any) => ({
      ...row.card.toJSON(),
      obtention: { method }
    }));
  }

  public async getCardAllObtentionMethods(
    cardId: number
  ): Promise<CardAllObtentionMethodsResult | null> {
    const card = await CardModel.findByPk(cardId, { attributes: ['id', 'name'] });
    if (!card) {
      return null;
    }

    const [packs, converters, characters, tutorials, initialDeck, sandwich] = await Promise.all([
      CardPackObtentionModel.findAll({
        where: { cardId },
        include: [{ model: PackModel, as: 'pack' }]
      }),
      CardConverterObtentionModel.findAll({ where: { cardId } }),
      CardCharacterObtentionModel.findAll({
        where: { cardId },
        include: [{ model: CharacterModel, as: 'character' }]
      }),
      CardTutorialObtentionModel.findAll({ where: { cardId } }),
      CardInitialDeckModel.findOne({ where: { cardId } }),
      CardSandwichObtentionModel.findOne({ where: { card_id: cardId } })
    ]);

    return {
      card: { id: card.id, name: card.name },
      obtentionMethods: this.formatCardObtentionMethods({
        packs,
        converters,
        characters,
        tutorials,
        initialDeck,
        sandwich
      })
    };
  }

  private formatCardObtentionMethods(sources: {
    packs: any[];
    converters: CardConverterObtentionModel[];
    characters: any[];
    tutorials: CardTutorialObtentionModel[];
    initialDeck: CardInitialDeckModel | null;
    sandwich: CardSandwichObtentionModel | null;
  }): CardAllObtentionMethodsResult['obtentionMethods'] {
    const methods: CardAllObtentionMethodsResult['obtentionMethods'] = {};

    if (sources.packs.length > 0) {
      methods.pack = sources.packs.map(item => ({
        sourceId: item.packId,
        sourceName: item.pack?.name || 'Pack desconocido'
      }));
    }
    if (sources.converters.length > 0) {
      methods.converter = sources.converters.map(item => ({
        details: `Requiere ${item.cardsRequired} carta(s)`
      }));
    }
    if (sources.characters.length > 0) {
      methods.victory = sources.characters.map(item => ({
        sourceId: item.characterId,
        sourceName: item.character?.name || 'Personaje desconocido',
        details: `Requiere nivel de confianza ${item.requiredTrust}. Cantidad: ${item.quantity}`
      }));
    }
    if (sources.tutorials.length > 0) {
      methods.tutorial = sources.tutorials.map(item => ({
        details: `Día ${item.day} del tutorial`
      }));
    }
    if (sources.initialDeck) {
      methods.initial = [
        { details: `Cantidad en mazo inicial: ${sources.initialDeck.quantity}` }
      ];
    }
    if (sources.sandwich) {
      methods.sandwich = [
        { details: 'Se obtiene con Plain Sandwich en la tienda.' }
      ];
    }

    return methods;
  }
}

