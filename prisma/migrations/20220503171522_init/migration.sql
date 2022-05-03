-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenresOnItems" (
    "itemId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "GenresOnItems_pkey" PRIMARY KEY ("itemId","genreId")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preference" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "Preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Neighborhood" (
    "id" SERIAL NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "leftUserId" INTEGER NOT NULL,
    "rightUserId" INTEGER NOT NULL,

    CONSTRAINT "Neighborhood_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GenresOnItems" ADD CONSTRAINT "GenresOnItems_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenresOnItems" ADD CONSTRAINT "GenresOnItems_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Neighborhood" ADD CONSTRAINT "Neighborhood_leftUserId_fkey" FOREIGN KEY ("leftUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Neighborhood" ADD CONSTRAINT "Neighborhood_rightUserId_fkey" FOREIGN KEY ("rightUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
