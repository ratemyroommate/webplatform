-- CreateTable
CREATE TABLE "CompatibilityAnswers" (
    "id" TEXT NOT NULL,
    "questionIndex" INTEGER NOT NULL,
    "answerIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "CompatibilityAnswers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompatibilityAnswers_createdById_questionIndex_key" ON "CompatibilityAnswers"("createdById", "questionIndex");

-- AddForeignKey
ALTER TABLE "CompatibilityAnswers" ADD CONSTRAINT "CompatibilityAnswers_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
