import http from 'http';
import { AddressInfo } from 'net';
import app from '../../src/app';
import { sequelize } from '../../src/infrastructure/config/database.config';

interface TestHttpResponse {
  statusCode: number;
  body: any;
}

let server: http.Server;
let baseUrl: string;

async function getJson(path: string): Promise<TestHttpResponse> {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.json();
  return {
    statusCode: response.status,
    body
  };
}

function expectStatusOk(res: TestHttpResponse): void {
  expect({ statusCode: res.statusCode, error: res.body?.error }).toEqual({
    statusCode: 200,
    error: undefined
  });
}

describe('MySQL End-to-End Integration Suite', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
    await new Promise<void>(resolve => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close(err => (err ? reject(err) : resolve()));
      });
    }
    await sequelize.close();
  });

  describe('1. GET /api/cards (Catálogo y Búsqueda Avanzada)', () => {
    it('devuelve lista de cartas sin filtros con paginación por defecto (24)', async () => {
      const res = await getJson('/api/cards');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeLessThanOrEqual(24);
      expect(res.body.data.pagination.pageSize).toBe(24);
    });

    it('filtra por nombre parcial, código y password', async () => {
      const byName = await getJson('/api/cards?name=Blue-Eyes');
      expect(byName.statusCode).toBe(200);
      if (byName.body.data.items.length > 0) {
        expect(byName.body.data.items[0].name.toLowerCase()).toContain('blue-eyes');
      }

      const byPassword = await getJson('/api/cards?password=89631139');
      expect(byPassword.statusCode).toBe(200);
      if (byPassword.body.data.items.length > 0) {
        expect(byPassword.body.data.items[0].password).toBe('89631139');
      }
    });

    it('filtra correctamente por cardType=Monster, Spell y Trap (bug card_type corregido)', async () => {
      const monsters = await getJson('/api/cards?cardType=Monster&pageSize=5');
      expect(monsters.statusCode).toBe(200);
      expect(monsters.body.data.items.length).toBeGreaterThan(0);
      monsters.body.data.items.forEach((card: any) => {
        expect(card.cardType).toBe('Monster');
        expect(card.monsterData).toBeTruthy();
      });

      const spells = await getJson('/api/cards?cardType=Spell&spellType=Normal&pageSize=5');
      expect(spells.statusCode).toBe(200);
      spells.body.data.items.forEach((card: any) => {
        expect(card.cardType).toBe('Spell');
        expect(card.spellData.type).toBe('Normal');
      });

      const traps = await getJson('/api/cards?cardType=Trap&trapType=Counter&pageSize=5');
      expect(traps.statusCode).toBe(200);
      traps.body.data.items.forEach((card: any) => {
        expect(card.cardType).toBe('Trap');
        expect(card.trapData.type).toBe('Counter');
      });
    });

    it('filtra monstruos por atributo, tipo, rangos de nivel y ATK/DEF, y ordena por ATK DESC', async () => {
      const res = await getJson(
        '/api/cards?cardType=Monster&attribute=DARK&type=Dragon&levelMin=7&attackMin=2000&sortBy=attack&sortOrder=desc&pageSize=10'
      );

      expectStatusOk(res);
      const items = res.body.data.items;
      items.forEach((card: any) => {
        expect(card.monsterData.attribute).toBe('DARK');
        expect(card.monsterData.type).toBe('Dragon');
        expect(card.monsterData.level).toBeGreaterThanOrEqual(7);
        if (card.monsterData.attack !== null) {
          expect(card.monsterData.attack).toBeGreaterThanOrEqual(2000);
        }
      });

      const attacks = items
        .map((c: any) => c.monsterData?.attack)
        .filter((a: any) => a !== null && a !== undefined);
      for (let i = 0; i < attacks.length - 1; i++) {
        expect(attacks[i]).toBeGreaterThanOrEqual(attacks[i + 1]);
      }
    });

    it('integra correctamente limitList y limitFilter (forbidden=0 y unlimited=3)', async () => {
      const forbiddenRes = await getJson(
        '/api/cards?limitList=Game+Original&limitFilter=0&pageSize=5'
      );
      expect(forbiddenRes.statusCode).toBe(200);
      forbiddenRes.body.data.items.forEach((card: any) => {
        expect(card.limitStatus.listName).toBe('Game Original');
        expect(card.limitStatus.limit).toBe(0);
        expect(card.limitStatus.status).toBe('forbidden');
      });

      const unlimitedRes = await getJson(
        '/api/cards?limitList=Game+Original&limitFilter=3&pageSize=5'
      );
      expect(unlimitedRes.statusCode).toBe(200);
      unlimitedRes.body.data.items.forEach((card: any) => {
        expect(card.limitStatus.limit).toBe(3);
      });
    });
  });

  describe('2. GET /api/cards/:id (Detalle de Carta)', () => {
    it('devuelve detalle completo de carta existente sin embeddings sensibles', async () => {
      const listRes = await getJson('/api/cards?cardType=Monster&pageSize=1');
      const firstId = listRes.body.data.items[0].id;

      const res = await getJson(`/api/cards/${firstId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(firstId);
      expect(res.body.data.monsterData).toBeTruthy();
      expect(res.body.data).not.toHaveProperty('clip_embedding');
      if (res.body.data.password) {
        expect(res.body.data.images).toHaveProperty('normal');
        expect(res.body.data.images).toHaveProperty('small');
        expect(res.body.data.images).toHaveProperty('cropped');
      }
    });

    it('devuelve 404 para ID inexistente y 400 para ID inválido o negativo', async () => {
      const notFound = await getJson('/api/cards/999999');
      expect(notFound.statusCode).toBe(404);
      expect(notFound.body.success).toBe(false);

      const invalidId = await getJson('/api/cards/abc');
      expect(invalidId.statusCode).toBe(400);
      expect(invalidId.body.success).toBe(false);

      const negativeId = await getJson('/api/cards/-1');
      expect(negativeId.statusCode).toBe(400);
      expect(negativeId.body.success).toBe(false);
    });
  });

  describe('3. Limit Lists, Genres, Archetypes, Types & Images Stats', () => {
    it('verifica /api/limit-lists y estadísticas por lista', async () => {
      const listsRes = await getJson('/api/limit-lists');
      expect(listsRes.statusCode).toBe(200);
      expect(listsRes.body.success).toBe(true);
      expect(Array.isArray(listsRes.body.data.lists)).toBe(true);

      const allStatsRes = await getJson('/api/limit-lists/stats');
      expect(allStatsRes.statusCode).toBe(200);
      expect(allStatsRes.body.success).toBe(true);
      expect(Array.isArray(allStatsRes.body.data.lists)).toBe(true);

      if (listsRes.body.data.lists.length > 0) {
        const listName = listsRes.body.data.lists[0];
        const singleStats = await getJson(
          `/api/limit-lists/${encodeURIComponent(listName)}/stats`
        );
        expect(singleStats.statusCode).toBe(200);
        expect(singleStats.body.data.listName).toBe(listName);
      }

      const missingList = await getJson('/api/limit-lists/NonExistentList/stats');
      expect(missingList.statusCode).toBe(404);
      expect(missingList.body.success).toBe(false);
    });

    it('verifica /api/genres, /api/archetypes, /api/types y /api/images/stats', async () => {
      const genres = await getJson('/api/genres');
      expect(genres.statusCode).toBe(200);
      expect(Array.isArray(genres.body.data)).toBe(true);

      const archetypes = await getJson('/api/archetypes');
      expect(archetypes.statusCode).toBe(200);
      expect(Array.isArray(archetypes.body.data)).toBe(true);

      const types = await getJson('/api/types');
      expect(types.statusCode).toBe(200);
      expect(types.body.data).toContain('Dragon');

      const imgStats = await getJson('/api/images/stats');
      expect(imgStats.statusCode).toBe(200);
      expect(imgStats.body.success).toBe(true);
      expect(typeof imgStats.body.normalCount).toBe('number');
    });
  });

  describe('4. Packs, Obtentions, Characters, Decks, GameStats & Icons', () => {
    it('verifica endpoints de /api/packs y /api/obtentions', async () => {
      const packsRes = await getJson('/api/packs');
      expect(packsRes.statusCode).toBe(200);
      expect(Array.isArray(packsRes.body.data)).toBe(true);

      if (packsRes.body.data.length > 0) {
        const packId = packsRes.body.data[0].id;
        const packDetail = await getJson(`/api/packs/${packId}`);
        expect(packDetail.statusCode).toBe(200);

        const packCards = await getJson(`/api/packs/${packId}/cards`);
        expect(packCards.statusCode).toBe(200);
        expect(Array.isArray(packCards.body.data)).toBe(true);
      }

      const methodsRes = await getJson('/api/obtentions/methods');
      expect(methodsRes.statusCode).toBe(200);
      expect(Array.isArray(methodsRes.body.data)).toBe(true);

      const converterRes = await getJson('/api/obtentions/converter');
      expect(converterRes.statusCode).toBe(200);
      expect(converterRes.body.success).toBe(true);

      const initialDeckRes = await getJson('/api/obtentions/initial-deck');
      expect(initialDeckRes.statusCode).toBe(200);
      expect(initialDeckRes.body.success).toBe(true);
    });

    it('verifica endpoints de /api/characters, /api/decks, /api/game-stats y /api/icons', async () => {
      const charsRes = await getJson('/api/characters');
      expect(charsRes.statusCode).toBe(200);
      expect(charsRes.body.success).toBe(true);

      if (charsRes.body.data.length > 0) {
        const charId = charsRes.body.data[0].id;
        const charDetail = await getJson(`/api/characters/${charId}`);
        expect(charDetail.statusCode).toBe(200);
        expect(charDetail.body.success).toBe(true);

        const charDecks = await getJson(`/api/characters/${charId}/decks?limit=5`);
        expect(charDecks.statusCode).toBe(200);
        expect(charDecks.body.success).toBe(true);
      }

      const decksRes = await getJson('/api/decks');
      expect(decksRes.statusCode).toBe(200);
      expect(decksRes.body.success).toBe(true);

      if (decksRes.body.data.length > 0) {
        const deckId = decksRes.body.data[0].id;
        const deckDetail = await getJson(`/api/decks/${deckId}`);
        expect(deckDetail.statusCode).toBe(200);
        expect(deckDetail.body.success).toBe(true);
      }

      const bonusRes = await getJson('/api/game-stats/bonus');
      expect(bonusRes.statusCode).toBe(200);
      expect(bonusRes.body.success).toBe(true);

      const challengeRes = await getJson('/api/game-stats/challenge');
      expect(challengeRes.statusCode).toBe(200);
      expect(challengeRes.body.success).toBe(true);

      const highScoreRes = await getJson('/api/game-stats/high-score');
      expect(highScoreRes.statusCode).toBe(200);
      expect(highScoreRes.body.success).toBe(true);

      const iconsRes = await getJson('/api/icons');
      expectStatusOk(iconsRes);
      expect(iconsRes.body.success).toBe(true);
    });
  });

  describe('5. Fase 4: Semantic Search (CLIP), Visual Search & Gestión de Imágenes', () => {
    it('verifica /api/semantic-search/stats, búsqueda semántica y /api/semantic-search/test', async () => {
      const statsRes = await getJson('/api/semantic-search/stats');
      expectStatusOk(statsRes);
      expect(statsRes.body.success).toBe(true);
      expect(statsRes.body.data).toHaveProperty('cardsWithClipEmbedding');

      if (statsRes.body.data.cardsWithClipEmbedding > 0) {
        const searchRes = await getJson('/api/semantic-search?query=drag%C3%B3n+azul&limit=5');
        expectStatusOk(searchRes);
        expect(searchRes.body.success).toBe(true);
        expect(Array.isArray(searchRes.body.data)).toBe(true);
        expect(searchRes.body.data.length).toBeGreaterThan(0);

        const testRes = await getJson('/api/semantic-search/test');
        expectStatusOk(testRes);
        expect(testRes.body.success).toBe(true);
        expect(testRes.body.data.testResults).toHaveLength(4);
      }

      const emptyQueryRes = await getJson('/api/semantic-search?query=');
      expect(emptyQueryRes.statusCode).toBe(400);
      expect(emptyQueryRes.body.success).toBe(false);
    });

    it('verifica /api/semantic-search/style, /api/semantic-search/similar/:cardId y /api/images/missing', async () => {
      const byStyle = await getJson('/api/semantic-search/style?style=blue-dragon&limit=5');
      expectStatusOk(byStyle);
      expect(byStyle.body.success).toBe(true);
      expect(byStyle.body.data.style).toBe('blue-dragon');

      const similarRes = await getJson('/api/semantic-search/similar/1?limit=5');
      expectStatusOk(similarRes);
      expect(similarRes.body.success).toBe(true);
      expect(similarRes.body.data.referenceCardId).toBe('1');

      const missingRes = await getJson('/api/images/missing?limit=10&offset=0&type=normal&format=jpg');
      expectStatusOk(missingRes);
      expect(missingRes.body.success).toBe(true);
      expect(Array.isArray(missingRes.body.data.cards)).toBe(true);
    });
  });
});
