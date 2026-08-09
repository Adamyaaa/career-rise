-- Feedback is now one-way: a student sends it, mentors read it, nobody replies.
-- Rows whose author wasn't the student were mentor replies. They must be deleted rather
-- than left behind, because once authorId is gone they would read as messages the
-- student themselves had written.
DELETE FROM "lesson_feedback" WHERE "authorId" <> "studentId";

-- DropForeignKey
ALTER TABLE "lesson_feedback" DROP CONSTRAINT "lesson_feedback_authorId_fkey";

-- DropIndex
DROP INDEX "lesson_feedback_lessonId_studentId_idx";

-- AlterTable
ALTER TABLE "lesson_feedback" DROP COLUMN "authorId";

-- CreateIndex
CREATE INDEX "lesson_feedback_cohortId_createdAt_idx" ON "lesson_feedback"("cohortId", "createdAt");
