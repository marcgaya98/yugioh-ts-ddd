import { Genre } from '../entities/genre.entity';

export interface GenreRepository {
  findAll(): Promise<Genre[]>;
}

