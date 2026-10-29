import { GenreModel } from '../../models/genre.model';
import { Genre } from '../../../../domain/catalog/entities/genre.entity';
import { GenreRepository } from '../../../../domain/catalog/repositories/genre.repository.interface';

export class SequelizeGenreRepository implements GenreRepository {
  public async findAll(): Promise<Genre[]> {
    const rows = await GenreModel.findAll({
      attributes: ['id', 'name', 'category']
    });

    return rows.map(
      row =>
        new Genre({
          id: row.id,
          name: row.name,
          category: row.category
        })
    );
  }
}

