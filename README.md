# Yu-Gi-Oh! GX Tag Force Guide — Backend (`yugioh-ts-ddd`)

Backend API RESTful en **TypeScript** diseñado bajo **Domain-Driven Design (DDD)**, **Clean Architecture** y **Principios SOLID** para la guía de *Yu-Gi-Oh! GX Tag Force*.

---

## Arquitectura por Capas y Bounded Contexts

```
src/
├── domain/          # Entidades ricas, Value Objects, Servicios de Dominio e Interfaces (Puertos)
│   ├── shared/      # CardPassword, PaginationCriteria, DomainError
│   ├── catalog/     # Card, Genre, CardSearchCriteria, CardRepository
│   ├── limit-list/  # LimitListSummary, LimitListRepository
│   ├── obtention/   # ObtentionMethodResolver, ExclusiveCardCalculator, PackRepository
│   ├── duelist/     # CharacterRepository, DeckRepository
│   ├── game-stats/  # GameStatsRepository, IconRepository
│   ├── media/       # ImageStoragePort, CardImageMetadataPort
│   └── ai-search/   # VisualSimilarityCalculator, VISUAL_CONCEPTS, CardEmbeddingRepository
├── application/     # Casos de Uso orquestadores (SLAP / SRP)
├── infrastructure/  # Modelos Sequelize (MySQL), Repositorios, Adaptadores (CLIP Xenova, Sharp) y DI Container
└── presentation/    # Controladores Express, Rutas, Middlewares y Respuesta Estandarizada { success, data, meta? }
```

---

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Ejecutar suite de tests (57 tests unitarios y E2E contra MySQL)
npm test

# Iniciar servidor en puerto 3001
npm start
```

- **API Base**: `http://localhost:3001/api`
- **Laboratorio Visual CLIP (`clip_embedding`)**: `http://localhost:3001/visual-search.html`

---

## Ejecución con Docker

```bash
# Construir y levantar API + MySQL
docker compose up -d --build

# Ver logs del contenedor
docker compose logs -f api
```

