-- AlterTable
ALTER TABLE "project" ADD COLUMN     "outline" JSONB,
ALTER COLUMN "slides" SET DEFAULT '[]';
