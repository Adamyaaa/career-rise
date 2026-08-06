-- AlterTable
ALTER TABLE "shared_files" ADD COLUMN     "lessonId" TEXT;

-- CreateIndex
CREATE INDEX "shared_files_lessonId_idx" ON "shared_files"("lessonId");

-- AddForeignKey
ALTER TABLE "shared_files" ADD CONSTRAINT "shared_files_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
