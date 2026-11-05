# ADR 003 · Explicit local preview

Status: accepted for Phase 1. The interactive preview stores sample/user-created habits locally and is visibly labeled. It can be cleared independently and does not sync. API health is real, while proposed feature endpoints remain unexposed until Firebase verification and owner-scoped persistence pass tests.

Alternatives: a hardcoded development user in API handlers risks an authentication bypass; static mockups do not test core interactions. The preview enables art/navigation/domain review without pretending remote infrastructure is configured. Before real sign-in, separate preview storage from authenticated data and offer deliberate import with duplicate/conflict handling.
