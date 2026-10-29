import { Pack } from '../entities/pack.entity';

export interface PackRepository {
  findAll(): Promise<Pack[]>;
  findById(id: number): Promise<Pack | null>;
  findCardsByPackId(packId: number): Promise<Record<string, unknown>[]>;
}

