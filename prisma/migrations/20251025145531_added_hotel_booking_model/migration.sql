/*
  Warnings:

  - A unique constraint covering the columns `[google_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "google_email" TEXT,
ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "provider" TEXT DEFAULT 'local',
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."HotelBooking" (
    "id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "check_in_date" TIMESTAMP(3) NOT NULL,
    "check_out_date" TIMESTAMP(3) NOT NULL,
    "guests" INTEGER NOT NULL DEFAULT 1,
    "rooms" INTEGER NOT NULL DEFAULT 1,
    "special_requests" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "hotel_id" TEXT NOT NULL,
    "user_id" TEXT,
    "created_by_id" TEXT,
    "updated_by_id" TEXT,
    "deleted_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "HotelBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "public"."User"("google_id");

-- AddForeignKey
ALTER TABLE "public"."HotelBooking" ADD CONSTRAINT "HotelBooking_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "public"."Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HotelBooking" ADD CONSTRAINT "HotelBooking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HotelBooking" ADD CONSTRAINT "HotelBooking_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HotelBooking" ADD CONSTRAINT "HotelBooking_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HotelBooking" ADD CONSTRAINT "HotelBooking_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
