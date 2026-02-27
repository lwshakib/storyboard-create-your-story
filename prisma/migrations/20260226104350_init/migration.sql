/*
  Warnings:

  - You are about to drop the column `outline` on the `project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project" DROP COLUMN "outline",
ADD COLUMN     "description" TEXT;
