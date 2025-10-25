/*
  Warnings:

  - A unique constraint covering the columns `[rut]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "rut" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_rut_key" ON "users"("rut");
