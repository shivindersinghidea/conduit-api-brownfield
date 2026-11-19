-- Migration: add reading lists tables

CREATE TABLE "ReadingList" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) DEFAULT now() NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "ReadingList_userId_name_key" ON "ReadingList" ("userId", "name");

CREATE TABLE "ReadingListItem" (
    "id" SERIAL PRIMARY KEY,
    "readingListId" INTEGER NOT NULL REFERENCES "ReadingList"(id) ON DELETE CASCADE,
    "articleId" INTEGER NOT NULL REFERENCES "Article"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "ReadingListItem_readingListId_articleId_key" ON "ReadingListItem" ("readingListId", "articleId");
