/*
  Warnings:

  - You are about to drop the `CompatibilityAnswers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompatibilityAnswers" DROP CONSTRAINT "CompatibilityAnswers_createdById_fkey";

-- DropTable
DROP TABLE "CompatibilityAnswers";

-- CreateTable
CREATE TABLE "CompatibilityAnswer" (
    "id" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "answerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "CompatibilityAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompatibilityQuestionOption" (
    "id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "CompatibilityAnswerOption" (
    "id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CompatibilityAnswer_createdById_questionId_key" ON "CompatibilityAnswer"("createdById", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "CompatibilityQuestionOption_id_key" ON "CompatibilityQuestionOption"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CompatibilityQuestionOption_order_key" ON "CompatibilityQuestionOption"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CompatibilityAnswerOption_id_key" ON "CompatibilityAnswerOption"("id");

-- AddForeignKey
ALTER TABLE "CompatibilityAnswer" ADD CONSTRAINT "CompatibilityAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CompatibilityQuestionOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibilityAnswer" ADD CONSTRAINT "CompatibilityAnswer_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "CompatibilityAnswerOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibilityAnswer" ADD CONSTRAINT "CompatibilityAnswer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibilityAnswerOption" ADD CONSTRAINT "CompatibilityAnswerOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CompatibilityQuestionOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
