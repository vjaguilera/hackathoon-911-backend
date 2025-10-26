/*
  Warnings:

  - Changed the type of `primary_provider` on the `health_insurance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "health_insurance" DROP COLUMN "primary_provider",
ADD COLUMN     "primary_provider" BOOLEAN NOT NULL;
