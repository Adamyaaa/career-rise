/*
  Warnings:

  - You are about to drop the column `body` on the `lesson_feedback` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lesson_feedback" DROP COLUMN "body",
ADD COLUMN     "responses" JSONB NOT NULL DEFAULT '{}';
