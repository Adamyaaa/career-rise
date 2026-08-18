/*
  Warnings:

  - You are about to drop the column `slidesUrl` on the `lessons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "slidesUrl",
ADD COLUMN     "slides" JSONB NOT NULL DEFAULT '[]';
