/*
  Warnings:

  - You are about to alter the column `price` on the `Hotel` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "public"."Hotel" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;
