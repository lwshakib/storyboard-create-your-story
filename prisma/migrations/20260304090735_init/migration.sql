/*
  Warnings:

  - You are about to drop the column `slides` on the `project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project" DROP COLUMN "slides";

-- CreateTable
CREATE TABLE "slide" (
    "id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "content" TEXT,
    "prompt" TEXT,
    "html" TEXT,
    "assets" JSONB NOT NULL DEFAULT '[]',
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "slide_projectId_idx" ON "slide"("projectId");

-- AddForeignKey
ALTER TABLE "slide" ADD CONSTRAINT "slide_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
