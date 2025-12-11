-- CreateTable
CREATE TABLE "movies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "movie_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    CONSTRAINT "ratings_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
