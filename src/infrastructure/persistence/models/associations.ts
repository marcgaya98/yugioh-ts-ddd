import { CardModel } from './card.model';
import { CardLimitListModel } from './card-limit-list.model';
import { MonsterCardModel } from './monster-card.model';
import { SpellCardModel } from './spell-card.model';
import { TrapCardModel } from './trap-card.model';
import { GenreModel } from './genre.model';
import { CardGenreModel } from './card-genre.model';
import { DeckModel } from './deck.model';
import { CharacterModel } from './character.model';
import { CharacterSandwichRatingModel } from './character-sandwich-rating.model';
import { CardTutorialObtentionModel } from './card-tutorial-obtention.model';
import { CardInitialDeckModel } from './card-initial-deck.model';
import { CardPackObtentionModel } from './card-pack-obtention.model';
import { CardConverterObtentionModel } from './card-converter-obtention.model';
import { CardCharacterObtentionModel } from './card-character-obtention.model';
import { CardSandwichObtentionModel } from './card-sandwich-obtention.model';
import { PackModel } from './pack.model';
import { FusionMaterialModel } from './fusion-material.model';
import { RitualMonsterSpellModel } from './ritual-monster-spell.model';
import { DeckCardModel } from './deck-card.model';

let associationsConfigured = false;

export function setupModelAssociations(): void {
  if (associationsConfigured) {
    return;
  }

  CardModel.hasMany(CardLimitListModel, {
    foreignKey: 'cardId',
    as: 'limitLists',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  CardLimitListModel.belongsTo(CardModel, {
    foreignKey: 'cardId',
    as: 'card',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  CardModel.hasOne(MonsterCardModel, {
    foreignKey: 'cardId',
    as: 'monsterData',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  CardModel.hasOne(SpellCardModel, {
    foreignKey: 'cardId',
    as: 'spellData',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  CardModel.hasOne(TrapCardModel, {
    foreignKey: 'cardId',
    as: 'trapData',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  MonsterCardModel.belongsTo(CardModel, { foreignKey: 'cardId', as: 'card' });
  SpellCardModel.belongsTo(CardModel, { foreignKey: 'cardId', as: 'card' });
  TrapCardModel.belongsTo(CardModel, { foreignKey: 'cardId', as: 'card' });

  CardModel.belongsToMany(GenreModel, {
    through: CardGenreModel,
    as: 'genres',
    foreignKey: 'cardId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  GenreModel.belongsToMany(CardModel, {
    through: CardGenreModel,
    as: 'cards',
    foreignKey: 'genreId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  CharacterModel.hasMany(CharacterSandwichRatingModel, {
    foreignKey: 'characterId',
    as: 'sandwichRatings',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  CharacterSandwichRatingModel.belongsTo(CharacterModel, {
    foreignKey: 'characterId',
    as: 'character'
  });

  CharacterModel.hasMany(DeckModel, {
    foreignKey: 'characterId',
    as: 'decks',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  DeckModel.belongsTo(CharacterModel, {
    foreignKey: 'characterId',
    as: 'owner',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  CardModel.hasMany(CardTutorialObtentionModel, {
    foreignKey: 'cardId',
    as: 'tutorialObtentions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  CardTutorialObtentionModel.belongsTo(CardModel, {
    foreignKey: 'cardId',
    as: 'card',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  CardModel.hasOne(CardInitialDeckModel, {
    foreignKey: 'cardId',
    as: 'initialDeck',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  CardInitialDeckModel.belongsTo(CardModel, {
    foreignKey: 'cardId',
    as: 'card',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  CardModel.hasOne(CardSandwichObtentionModel, {
    foreignKey: 'card_id',
    as: 'sandwichObtention',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  CardSandwichObtentionModel.belongsTo(CardModel, {
    foreignKey: 'card_id',
    as: 'card',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  CardModel.belongsToMany(PackModel, {
    through: CardPackObtentionModel,
    foreignKey: 'cardId',
    otherKey: 'packId',
    as: 'packs'
  });
  PackModel.belongsToMany(CardModel, {
    through: CardPackObtentionModel,
    foreignKey: 'packId',
    otherKey: 'cardId',
    as: 'cards'
  });
  CardModel.hasMany(CardPackObtentionModel, {
    foreignKey: 'cardId'
  });
  CardPackObtentionModel.belongsTo(CardModel, {
    foreignKey: 'cardId',
    as: 'card',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  CardPackObtentionModel.belongsTo(PackModel, {
    foreignKey: 'packId',
    as: 'pack',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  CardModel.hasOne(CardConverterObtentionModel, {
    foreignKey: 'cardId',
    as: 'converterObtention',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  CardConverterObtentionModel.belongsTo(CardModel, {
    foreignKey: 'cardId',
    as: 'card',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  CardModel.belongsToMany(CharacterModel, {
    through: CardCharacterObtentionModel,
    foreignKey: 'cardId',
    otherKey: 'characterId',
    as: 'characterObtentions'
  });
  CharacterModel.belongsToMany(CardModel, {
    through: CardCharacterObtentionModel,
    foreignKey: 'characterId',
    otherKey: 'cardId',
    as: 'rewardCards'
  });
  CardModel.hasMany(CardCharacterObtentionModel, {
    foreignKey: 'cardId'
  });
  CardCharacterObtentionModel.belongsTo(CardModel, {
    foreignKey: 'cardId',
    as: 'card',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  CardCharacterObtentionModel.belongsTo(CharacterModel, {
    foreignKey: 'characterId',
    as: 'character',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  CardModel.hasMany(FusionMaterialModel, {
    foreignKey: 'fusionId',
    as: 'fusionMaterials',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  CardModel.hasMany(FusionMaterialModel, {
    foreignKey: 'materialId',
    as: 'asMaterialIn',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  FusionMaterialModel.belongsTo(CardModel, {
    foreignKey: 'fusionId',
    as: 'fusion',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  FusionMaterialModel.belongsTo(CardModel, {
    foreignKey: 'materialId',
    as: 'material',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  CardModel.hasMany(RitualMonsterSpellModel, {
    foreignKey: 'ritualMonsterId',
    as: 'ritualSpells'
  });
  CardModel.hasMany(RitualMonsterSpellModel, {
    foreignKey: 'ritualSpellId',
    as: 'ritualMonsters'
  });
  RitualMonsterSpellModel.belongsTo(CardModel, {
    foreignKey: 'ritualMonsterId',
    as: 'monster'
  });
  RitualMonsterSpellModel.belongsTo(CardModel, {
    foreignKey: 'ritualSpellId',
    as: 'spell'
  });

  DeckModel.hasMany(DeckCardModel, {
    foreignKey: 'deckId',
    as: 'cards'
  });
  DeckCardModel.belongsTo(DeckModel, {
    foreignKey: 'deckId',
    as: 'deck'
  });
  DeckCardModel.belongsTo(CardModel, {
    foreignKey: 'cardId',
    as: 'card'
  });
  CardModel.hasMany(DeckCardModel, {
    foreignKey: 'cardId',
    as: 'decks'
  });

  associationsConfigured = true;
}

