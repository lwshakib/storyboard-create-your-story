-- CreateTable
CREATE TABLE "advanced_project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Advanced Storyboard',
    "slides" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT,

    CONSTRAINT "advanced_project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "advanced_project_userId_idx" ON "advanced_project"("userId");

-- AddForeignKey
ALTER TABLE "advanced_project" ADD CONSTRAINT "advanced_project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
