# ADR 001 · Modular monolith

Status: accepted. One NestJS deployment with feature modules and PostgreSQL, one Expo client, shared contracts. Keep controllers, services, rules and persistence separate as each feature lands. Cross-module operations use application services, not controller imports. Firebase handles identity; the backend validates tokens and owns authorization.

Alternatives: microservices add deployments and failure modes without a measured scaling need; direct client-to-database access makes historical rule enforcement harder. A modular monolith supports multiple stateless replicas while remaining practical for a small team.
