import { EntityNotFoundError } from '../../../domain/shared/errors/domain.error';
import {
  CharacterDecksPage,
  CharacterProps,
  CharacterSearchFilters
} from '../../../domain/duelist/entities/character.entity';
import { CharacterRepository } from '../../../domain/duelist/repositories/character.repository.interface';

export class GetAllCharactersUseCase {
  constructor(private readonly characterRepository: CharacterRepository) {}

  public async execute(filters: CharacterSearchFilters): Promise<CharacterProps[]> {
    const characters = await this.characterRepository.findAll(filters);
    return characters.map(character => character.toJSON());
  }
}

export class GetCharacterByIdUseCase {
  constructor(private readonly characterRepository: CharacterRepository) {}

  public async execute(characterId: number): Promise<Record<string, unknown>> {
    const character = await this.characterRepository.findByIdWithRelations(characterId);
    if (!character) {
      throw new EntityNotFoundError('Character');
    }
    return character;
  }
}

export class GetCharacterDecksUseCase {
  constructor(private readonly characterRepository: CharacterRepository) {}

  public async execute(
    characterId: number,
    limit?: number,
    offset = 0
  ): Promise<CharacterDecksPage> {
    const page = await this.characterRepository.findDecksByCharacterId(
      characterId,
      limit,
      offset
    );
    if (!page) {
      throw new EntityNotFoundError('Character');
    }
    return page;
  }
}

