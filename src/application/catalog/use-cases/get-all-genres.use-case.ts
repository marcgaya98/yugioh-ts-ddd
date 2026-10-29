import { GenreProps } from '../../../domain/catalog/entities/genre.entity';
import { GenreRepository } from '../../../domain/catalog/repositories/genre.repository.interface';

export class GetAllGenresUseCase {
  constructor(private readonly genreRepository: GenreRepository) {}

  public async execute(): Promise<GenreProps[]> {
    const genres = await this.genreRepository.findAll();
    return genres.map(genre => genre.toJSON());
  }
}

