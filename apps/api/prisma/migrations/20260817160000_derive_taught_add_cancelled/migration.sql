-- Stop tracking "taught" by hand.
--
-- Whether a class has been delivered is now derived: a scheduled class whose time has
-- passed and which wasn't called off was taught. That leaves cancellation as the only
-- thing a mentor needs to record, so `taughtAt` has nothing left to say.

-- 1. Cancellation, the one piece the clock can't tell us.
ALTER TABLE "lessons" ADD COLUMN "cancelled" BOOLEAN NOT NULL DEFAULT false;

-- 2. Drop the hand-maintained flag. Nothing reads it after this migration: every caller
--    now derives the same answer from "scheduledAt" and "cancelled".
ALTER TABLE "lessons" DROP COLUMN "taughtAt";
