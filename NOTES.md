# Notes: AI tools and design decisions

## How AI helped

The only AI tool was Claude Code, through its extension in Cursor. It worked as a pair, not as a generator:

- **Planning partner.** Before any code, we went through stack, folder layout, API contract, cache strategy and HTTP client in a plan-mode conversation. I asked for opinions and trade-offs, pushed back where I disagreed, and approved each step before it ran. That conversation is where most of the decisions below were made, including where each kind of state should live.
- **Investigation.** It probed TheSportsDB with `curl` and found that the free key returns only 10 Soccer leagues from `all_leagues.php`, with no alternate names. That finding shaped the data-source decision.
- **First drafts.** Code and tests were drafted module by module; I read and adjusted all of it.
- **Checks I would have skipped by hand.** A benchmark of per-item validation cost before deciding to keep it, screenshots at 360px and 1280px, and request counting to prove the cache.

## Design decisions

- **React + Vite + TypeScript, MUI 9.** React is where I am most fluent. MUI gives accessible primitives and responsive layout out of the box.
- **Modules with the scope in the folder name, tests co-located.** `src/http/` (generic HTTP), `src/leagues/` (domain). `x.ts` next to `x.test.ts`; a type lives in the file that produces it.
- **State management: three kinds, three homes, no store.** Server state lives in TanStack Query (cache, deduplication, six sources combined with `useQueries`, per-source errors, Suspense in the dialog), exposed through `queryOptions` plus a key factory so callers pick `useQuery`, `useQueries` or `useSuspenseQuery`. Filter state lives in the URL (`?q=&sport=`), so it is shareable and survives refresh. The only local state is the selected league, a `useState` on the page. Sport options and the visible list are derived with `useMemo`, never stored. A Redux or Zustand store would have nothing left to hold; if server data started being edited client-side, that is when one would earn its place.
- **Hybrid data source.** `all_leagues.php` is the requirement and stays primary. It is enriched with `search_all_leagues.php?s=<sport>` for five sports, merged by `idLeague`, so the filter has more than one option. The dropdown is derived from the data, never from the fixed list.
- **zod at the boundary, strict envelope and tolerant items.** A wrong envelope fails loudly with a retry; a bad item is dropped and reported, never blanks the list. Domain types are the validated API types: with a large contract, renaming fields on the client does not scale.
- **Native `fetch` in one helper** with timeout, abort signal and a typed error. Two public GETs do not need axios.
- **UI states belong to their components.** Skeleton, progress while enriching, error with retry that keeps what already arrived, empty state with clear, and a badge dialog on `Suspense` plus an error boundary. The badge shown is the most recent season that has one.
- **Cache.** One hour of freshness, in memory. Clicking the same league twice makes one request; the README shows how to check.
- **Mobile-first**, checked at 360px and 1280px, no layout shift when the badge loads.
- **Tooling.** Strict TypeScript, zero `any`, type-aware ESLint, Prettier, Vitest.

## What I would do with more time

- **UI polish.** The interface is functional but plain: default MUI theme, no brand, no motion. Visual work was deliberately last, as the brief suggests.
- **Pre-commit hooks** with husky and lint-staged, running Prettier and ESLint on staged files so formatting never depends on remembering to run it.
- End-to-end tests with Playwright (drafted, then dropped for time), dark mode with MUI `colorSchemes`, a multi-select sport filter, persisted cache, CI, real monitoring behind the contract-violation hook.
