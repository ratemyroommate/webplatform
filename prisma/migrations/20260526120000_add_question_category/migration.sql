-- CreateEnum
CREATE TYPE "CompatibilityCategory" AS ENUM ('LIFESTYLE', 'SOCIAL', 'BOUNDARIES');

-- AlterTable: add column as nullable first so we can backfill safely
ALTER TABLE "CompatibilityQuestionOption" ADD COLUMN "category" "CompatibilityCategory";

-- Backfill existing seeded questions
UPDATE "CompatibilityQuestionOption" SET "category" = 'LIFESTYLE'  WHERE "id" IN (1, 5);
UPDATE "CompatibilityQuestionOption" SET "category" = 'SOCIAL'     WHERE "id" IN (2, 3);
UPDATE "CompatibilityQuestionOption" SET "category" = 'BOUNDARIES' WHERE "id" IN (4, 6);

-- Any future / unclassified rows default to LIFESTYLE so SET NOT NULL succeeds
UPDATE "CompatibilityQuestionOption" SET "category" = 'LIFESTYLE' WHERE "category" IS NULL;

-- Enforce non-null
ALTER TABLE "CompatibilityQuestionOption" ALTER COLUMN "category" SET NOT NULL;
