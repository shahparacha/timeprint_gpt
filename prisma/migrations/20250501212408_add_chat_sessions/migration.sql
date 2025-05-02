-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "messages" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "ChatSession_userId_idx" ON "ChatSession"("userId");

-- CreateIndex
CREATE INDEX "ChatSession_organizationId_idx" ON "ChatSession"("organizationId");
