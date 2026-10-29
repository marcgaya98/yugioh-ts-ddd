import { Op } from 'sequelize';
import { CardModel } from '../../models/card.model';
import {
  CardImageMetadataPort,
  CardPasswordRecord
} from '../../../../domain/media/repositories/image-storage.port';
import { CardPassword } from '../../../../domain/shared/value-objects/card-password.value-object';

export class SequelizeCardImageMetadataRepository implements CardImageMetadataPort {
  public async findAllValidPasswords(): Promise<Set<string>> {
    const rows = await CardModel.findAll({
      attributes: ['password'],
      where: { password: { [Op.not]: null } }
    });

    const validPasswords = new Set<string>();
    for (const row of rows) {
      if (!row.password) {
        continue;
      }
      validPasswords.add(row.password);
      const passwordVo = CardPassword.createOptional(row.password);
      if (passwordVo) {
        validPasswords.add(passwordVo.getNormalizedForUrl());
      }
    }

    return validPasswords;
  }

  public async findCardsWithPassword(
    limit: number,
    offset: number
  ): Promise<CardPasswordRecord[]> {
    const rows = await CardModel.findAll({
      attributes: ['id', 'name', 'password'],
      where: { password: { [Op.not]: null } },
      limit,
      offset,
      order: [['id', 'ASC']]
    });

    return rows
      .filter((row): row is CardModel & { password: string } => Boolean(row.password))
      .map(row => ({
        id: row.id,
        name: row.name,
        password: row.password
      }));
  }
}
