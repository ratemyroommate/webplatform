/*
  Warnings:

  - Added the required column `value` to the `CompatibilityAnswerOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompatibilityAnswerOption" ADD COLUMN "value" INTEGER NOT NULL DEFAULT 0;
