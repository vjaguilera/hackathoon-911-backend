-- AlterTable
ALTER TABLE "addresses" ALTER COLUMN "postal_code" DROP NOT NULL;

-- CreateTable
CREATE TABLE "validation_questions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validation_questions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "validation_questions" ADD CONSTRAINT "validation_questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
