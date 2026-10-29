import {
  Character,
  CharacterDecksPage,
  CharacterSearchFilters
} from '../entities/character.entity';

export interface CharacterRepository {
  findAll(filters: CharacterSearchFilters): Promise<Character[]>;
  findByIdWithRelations(id: number): Promise<Record<string, unknown> | null>;
  findDecksByCharacterId(
    characterId: number,
    limit?: number,
    offset?: number
  ): Promise<CharacterDecksPage | null>;
}

