-- CreateEnum
CREATE TYPE "Location" AS ENUM ('BUDAPEST', 'DEBRECEN', 'SZEGED');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "location" "Location" NOT NULL DEFAULT 'BUDAPEST';
