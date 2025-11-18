-- DropForeignKey
ALTER TABLE "CompatibilityAnswer" DROP CONSTRAINT "CompatibilityAnswer_answerId_fkey";

-- DropForeignKey
ALTER TABLE "CompatibilityAnswer" DROP CONSTRAINT "CompatibilityAnswer_createdById_fkey";

-- DropForeignKey
ALTER TABLE "CompatibilityAnswer" DROP CONSTRAINT "CompatibilityAnswer_questionId_fkey";

-- AddForeignKey
ALTER TABLE "CompatibilityAnswer" ADD CONSTRAINT "CompatibilityAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CompatibilityQuestionOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibilityAnswer" ADD CONSTRAINT "CompatibilityAnswer_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "CompatibilityAnswerOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibilityAnswer" ADD CONSTRAINT "CompatibilityAnswer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
