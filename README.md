# Sports Leagues

Single-page app that lists sports leagues from [TheSportsDB](https://www.thesportsdb.com/free_sports_api), with a search box, a sport filter and a season badge that loads when you click a league. Built for the Sporty Group frontend home assignment.

Design decisions and how AI tools were used: [NOTES.md](NOTES.md).

## Requirements

- Node 20.19 or newer
- yarn 1.x (`npm install` also works; yarn is the tested path)

## Run

```
yarn
yarn dev
```

`yarn test` runs the unit tests, `yarn build` type-checks and builds to `dist/`. Other scripts (`lint`, `format`, `typecheck`, `preview`) are in `package.json`.

## Configuration

`.env` holds the API base URL:

```
VITE_SPORTSDB_BASE_URL=https://www.thesportsdb.com/api/v1/json/3
```

## Project structure

```
src/
  main.tsx                 providers: QueryClientProvider, BrowserRouter
  App.tsx                  AppBar + LeaguesPage
  queryClient.ts           TanStack Query defaults and error logging
  http/                    generic HTTP: getJson (fetch + zod envelope), parseItems (per-item validation)
  leagues/                 the domain module
    api.ts                 zod contract, League and Season types, fetch functions
    queries.ts             query keys and queryOptions
    LeaguesPage.tsx        composes filters, list and dialog
    utils/                 pure functions: filterLeagues, mergeLeagues
    hooks/                 useLeagueSources (data), useLeagueFilters (URL state)
    components/            LeagueFilters, LeagueList, LeagueCard, BadgeDialog/
```

Tests sit next to the file they test (`x.ts` + `x.test.ts`). Types are declared in the file that produces them; there is no `types/` folder.

## Data source

On the free key, `all_leagues.php` returns only 10 Soccer leagues and no alternate names. The app keeps it as the primary source and enriches it with `search_all_leagues.php?s=<sport>` for five sports (Soccer, Basketball, Motorsport, Ice Hockey, American Football), merged by `idLeague`. The sport dropdown is derived from the merged data.
