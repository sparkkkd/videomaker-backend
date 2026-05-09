-- CreateTable
CREATE TABLE "FileUpload" (
    "id" TEXT NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "linked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileUpload_path_key" ON "FileUpload"("path");

-- CreateIndex
CREATE INDEX "FileUpload_linked_createdAt_idx" ON "FileUpload"("linked", "createdAt");
