-- AlterTable
ALTER TABLE "modules" ADD COLUMN     "scheduledFor" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "lesson_feedback" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lesson_feedback_lessonId_studentId_idx" ON "lesson_feedback"("lessonId", "studentId");

-- CreateIndex
CREATE INDEX "lesson_feedback_lessonId_idx" ON "lesson_feedback"("lessonId");

-- AddForeignKey
ALTER TABLE "lesson_feedback" ADD CONSTRAINT "lesson_feedback_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_feedback" ADD CONSTRAINT "lesson_feedback_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_feedback" ADD CONSTRAINT "lesson_feedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_feedback" ADD CONSTRAINT "lesson_feedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
