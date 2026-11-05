-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "HabitType" AS ENUM ('binary', 'numeric');

-- CreateEnum
CREATE TYPE "HabitColor" AS ENUM ('moss', 'sky', 'peach', 'rose');

-- CreateEnum
CREATE TYPE "HabitIcon" AS ENUM ('book', 'water', 'move', 'leaf', 'moon', 'code');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firebaseUid" VARCHAR(128) NOT NULL,
    "email" VARCHAR(320),
    "timezone" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habit" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "icon" "HabitIcon" NOT NULL,
    "color" "HabitColor" NOT NULL,
    "createdDate" DATE NOT NULL,
    "archivedDate" DATE,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitVersion" (
    "id" UUID NOT NULL,
    "habitId" UUID NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "type" "HabitType" NOT NULL,
    "targetValue" DECIMAL(12,3) NOT NULL,
    "unit" VARCHAR(24) NOT NULL,
    "weekdays" INTEGER[],
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderLocalTime" VARCHAR(5),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HabitVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitEntry" (
    "id" UUID NOT NULL,
    "habitId" UUID NOT NULL,
    "habitVersionId" UUID NOT NULL,
    "entryDate" DATE NOT NULL,
    "value" DECIMAL(12,3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "HabitEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE INDEX "Habit_userId_archivedDate_createdDate_idx" ON "Habit"("userId", "archivedDate", "createdDate");

-- CreateIndex
CREATE UNIQUE INDEX "HabitVersion_habitId_id_key" ON "HabitVersion"("habitId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "HabitVersion_habitId_effectiveFrom_key" ON "HabitVersion"("habitId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "HabitEntry_habitId_entryDate_key" ON "HabitEntry"("habitId", "entryDate");

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitVersion" ADD CONSTRAINT "HabitVersion_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitEntry" ADD CONSTRAINT "HabitEntry_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitEntry" ADD CONSTRAINT "HabitEntry_habitId_habitVersionId_fkey" FOREIGN KEY ("habitId", "habitVersionId") REFERENCES "HabitVersion"("habitId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Reviewed integrity rules not expressible in Prisma's schema language.
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE FUNCTION valid_weekdays(days INTEGER[]) RETURNS BOOLEAN
LANGUAGE SQL IMMUTABLE STRICT PARALLEL SAFE AS $$
  SELECT array_ndims(days) = 1
    AND cardinality(days) BETWEEN 1 AND 7
    AND days <@ ARRAY[1,2,3,4,5,6,7]
    AND array_position(days, NULL) IS NULL
    AND cardinality(days) = (SELECT count(DISTINCT day) FROM unnest(days) AS day);
$$;

ALTER TABLE "Habit" ADD CONSTRAINT "Habit_name_nonempty" CHECK (length(trim(name)) > 0);
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_lifetime" CHECK ("archivedDate" IS NULL OR "archivedDate" >= "createdDate");
ALTER TABLE "HabitVersion" ALTER COLUMN weekdays SET NOT NULL;
ALTER TABLE "HabitVersion" ADD CONSTRAINT "HabitVersion_target" CHECK ("targetValue" > 0 AND "targetValue" <= 999999999.999);
ALTER TABLE "HabitVersion" ADD CONSTRAINT "HabitVersion_binary_target" CHECK (type != 'binary' OR "targetValue" = 1);
ALTER TABLE "HabitVersion" ADD CONSTRAINT "HabitVersion_unit" CHECK (length(trim(unit)) > 0);
ALTER TABLE "HabitVersion" ADD CONSTRAINT "HabitVersion_days" CHECK (valid_weekdays(weekdays));
ALTER TABLE "HabitVersion" ADD CONSTRAINT "HabitVersion_ordered_dates" CHECK ("effectiveTo" IS NULL OR "effectiveTo" > "effectiveFrom");
ALTER TABLE "HabitVersion" ADD CONSTRAINT "HabitVersion_reminder_time" CHECK ("reminderLocalTime" IS NULL OR "reminderLocalTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
ALTER TABLE "HabitVersion" ADD CONSTRAINT "HabitVersion_reminder_enabled" CHECK (NOT "reminderEnabled" OR "reminderLocalTime" IS NOT NULL);
ALTER TABLE "HabitVersion" ADD CONSTRAINT "HabitVersion_no_overlap" EXCLUDE USING gist
  ("habitId" WITH =, daterange("effectiveFrom", "effectiveTo", '[)') WITH &&);
ALTER TABLE "HabitEntry" ADD CONSTRAINT "HabitEntry_quantity" CHECK (value >= 0 AND value <= 999999999.999);
