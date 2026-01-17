/*
  Warnings:

  - You are about to drop the `advanced_project` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('NORMAL', 'ADVANCED');

-- DropForeignKey
ALTER TABLE "advanced_project" DROP CONSTRAINT "advanced_project_userId_fkey";

-- AlterTable
ALTER TABLE "project" ADD COLUMN     "type" "ProjectType" NOT NULL DEFAULT 'NORMAL';

-- DropTable
DROP TABLE "advanced_project";
