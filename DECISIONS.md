# Technical decisions

| ADR                                              | Decision                                                  | Reason / alternative                                                                     |
| ------------------------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [001](docs/architecture/001-modular-monolith.md) | Expo + Nest modular monolith + PostgreSQL                 | Native UX and relational guarantees; defer microservices and managed all-in-one backends |
| [002](docs/architecture/002-calendar-history.md) | Local DATE keys and effective-dated rule versions         | Preserve historical meaning; reject recalculation using today's target                   |
| [003](docs/architecture/003-preview-boundary.md) | Explicit persistent local preview before auth integration | Review usable foundation without credentials; no development auth bypass in the API      |

Use npm workspaces and a committed lockfile rather than adding a task graph system for three packages. Shared code is small and framework-free. CI builds shared types before consumers. Use Prisma's reviewed SQL migration for integrity that its schema syntax cannot represent. Use PostgreSQL 17 as a stable supported baseline and Prisma 7 stable rather than an 8 prerelease. Use Nest 12 runtime directly without CLI scaffolding. Standardize the workspace on Node 24 LTS (24.15+) so the API, containers, CI and SDK 58 tests share one reference toolchain. Jest uses Expo's SDK defaults plus the documented Worklets/Reanimated resolver and setup. Expo native dependency versions come from the installed SDK's compatibility map.

Firebase, TanStack Query, Zustand, Reanimated, SVG and Expo Notifications remain the selected application stack. Notifications and Firebase configuration are deferred behind native integration acceptance gates; installing packages is not completion. The foundation does not make unsupported performance, security-audit, or store-readiness claims.
