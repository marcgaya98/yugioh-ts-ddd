import { EntityNotFoundError } from '../../../domain/shared/errors/domain.error';
import { PackProps } from '../../../domain/obtention/entities/pack.entity';
import { PackRepository } from '../../../domain/obtention/repositories/pack.repository.interface';

export class GetAllPacksUseCase {
  constructor(private readonly packRepository: PackRepository) {}

  public async execute(): Promise<PackProps[]> {
    const packs = await this.packRepository.findAll();
    return packs.map(pack => pack.toJSON());
  }
}

export class GetPackByIdUseCase {
  constructor(private readonly packRepository: PackRepository) {}

  public async execute(packId: number): Promise<PackProps> {
    const pack = await this.packRepository.findById(packId);
    if (!pack) {
      throw new EntityNotFoundError('Pack');
    }
    return pack.toJSON();
  }
}

export class GetPackCardsUseCase {
  constructor(private readonly packRepository: PackRepository) {}

  public async execute(packId: number): Promise<Record<string, unknown>[]> {
    const pack = await this.packRepository.findById(packId);
    if (!pack) {
      throw new EntityNotFoundError('Pack');
    }
    return this.packRepository.findCardsByPackId(packId);
  }
}

