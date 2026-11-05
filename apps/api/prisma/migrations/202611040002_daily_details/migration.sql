-- Additive migration: existing entries and historical rules remain unchanged.
ALTER TYPE "HabitIcon" ADD VALUE 'film';

CREATE TABLE "HabitEntryItem" (
  "id" UUID NOT NULL,
  "habitEntryId" UUID NOT NULL,
  "text" VARCHAR(160) NOT NULL,
  "position" SMALLINT NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "HabitEntryItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "HabitEntryItem_text_nonempty" CHECK (length(trim("text")) > 0),
  CONSTRAINT "HabitEntryItem_position" CHECK ("position" BETWEEN 0 AND 19),
  CONSTRAINT "HabitEntryItem_habitEntryId_fkey" FOREIGN KEY ("habitEntryId")
    REFERENCES "HabitEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- Together with the position bound this enforces at most 20 ordered items per entry.
CREATE UNIQUE INDEX "HabitEntryItem_habitEntryId_position_key"
  ON "HabitEntryItem"("habitEntryId", "position");
