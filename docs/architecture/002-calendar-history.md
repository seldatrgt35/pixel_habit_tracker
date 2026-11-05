# ADR 002 · Calendar identity and historical versions

Status: accepted. Entry identity is habit + local DATE. Targets, units, types and weekdays are effective-dated, non-overlapping versions. Changes become effective tomorrow. Store raw quantities and derive completion against the version applicable to that date. Rest days do not count against consistency or break streaks. Incomplete today does not end an existing streak until midnight in the selected timezone.

Alternatives: UTC day bucketing shifts user expectations; snapshotting only entries loses the target for missing days; mutable targets rewrite history. Versions preserve both missing-day denominators and historical quantities. Cost: transactional version transitions and bounded interval joins. Timezone changes never rewrite existing dates.
