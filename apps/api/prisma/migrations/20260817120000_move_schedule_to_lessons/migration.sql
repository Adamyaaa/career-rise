-- Move the schedule from modules down to individual classes.
--
-- A module is a container; the thing that actually happens at a time is a class. This
-- also gives each class a time-of-day, which `modules.scheduledFor` (date-only, anchored
-- to midday UTC) never carried.

-- 1. Add the new column.
ALTER TABLE "lessons" ADD COLUMN "scheduledAt" TIMESTAMP(3);

-- 2. Carry each module's existing date down to its classes before dropping it, so no
--    scheduling information is lost. Classes inherit their module's date as-is; a mentor
--    then sets the real per-class time. Ordering by "order" keeps the sequence stable but
--    every class in a module starts on the same day, which matches what the old model
--    could express.
UPDATE "lessons" l
SET "scheduledAt" = m."scheduledFor"
FROM "modules" m
WHERE l."moduleId" = m."id" AND m."scheduledFor" IS NOT NULL;

-- 3. Drop the module-level date.
ALTER TABLE "modules" DROP COLUMN "scheduledFor";
