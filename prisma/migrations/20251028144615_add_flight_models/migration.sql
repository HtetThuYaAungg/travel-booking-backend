-- CreateTable
CREATE TABLE "public"."Flight" (
    "id" TEXT NOT NULL,
    "flight_number" TEXT NOT NULL,
    "airline_name" TEXT NOT NULL,
    "airline_code" TEXT NOT NULL,
    "aircraft_type" TEXT NOT NULL,
    "departure_airport_code" TEXT NOT NULL,
    "departure_airport_name" TEXT NOT NULL,
    "departure_city" TEXT NOT NULL,
    "departure_country" TEXT NOT NULL,
    "arrival_airport_code" TEXT NOT NULL,
    "arrival_airport_name" TEXT NOT NULL,
    "arrival_city" TEXT NOT NULL,
    "arrival_country" TEXT NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "arrival_time" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "base_price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "available_seats" INTEGER NOT NULL DEFAULT 0,
    "total_seats" INTEGER NOT NULL DEFAULT 100,
    "class_type" TEXT NOT NULL DEFAULT 'Economy',
    "has_wifi" BOOLEAN NOT NULL DEFAULT false,
    "has_meal" BOOLEAN NOT NULL DEFAULT false,
    "has_entertainment" BOOLEAN NOT NULL DEFAULT false,
    "has_luggage" BOOLEAN NOT NULL DEFAULT true,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "is_domestic" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT,
    "updated_by_id" TEXT,
    "deleted_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FlightBooking" (
    "id" TEXT NOT NULL,
    "booking_reference" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_phone" TEXT,
    "passengers" JSONB NOT NULL,
    "total_passengers" INTEGER NOT NULL DEFAULT 1,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "return_date" TIMESTAMP(3),
    "total_price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "base_price" DOUBLE PRECISION NOT NULL,
    "taxes_fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discounts" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "seat_preferences" JSONB,
    "meal_preferences" JSONB,
    "special_requests" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'PENDING',
    "payment_status" TEXT NOT NULL DEFAULT 'PENDING',
    "flight_id" TEXT NOT NULL,
    "user_id" TEXT,
    "created_by_id" TEXT,
    "updated_by_id" TEXT,
    "deleted_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "FlightBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Flight_flight_number_departure_time_deleted_at_key" ON "public"."Flight"("flight_number", "departure_time", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "FlightBooking_booking_reference_key" ON "public"."FlightBooking"("booking_reference");

-- AddForeignKey
ALTER TABLE "public"."Flight" ADD CONSTRAINT "Flight_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Flight" ADD CONSTRAINT "Flight_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Flight" ADD CONSTRAINT "Flight_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlightBooking" ADD CONSTRAINT "FlightBooking_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "public"."Flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlightBooking" ADD CONSTRAINT "FlightBooking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlightBooking" ADD CONSTRAINT "FlightBooking_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlightBooking" ADD CONSTRAINT "FlightBooking_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlightBooking" ADD CONSTRAINT "FlightBooking_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
