/*
  Warnings:

  - The values [CREATED,DISPATCHED] on the enum `ShipmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `eventType` on the `WebhookEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "WebhookEventType" AS ENUM ('ORDER_FULFILLED', 'ORDER_UPDATED');

-- AlterEnum
BEGIN;
CREATE TYPE "ShipmentStatus_new" AS ENUM ('READY', 'IN_TRANSIT', 'DELIVERED', 'FAILED');
ALTER TABLE "Shipment" ALTER COLUMN "status" TYPE "ShipmentStatus_new" USING ("status"::text::"ShipmentStatus_new");
ALTER TYPE "ShipmentStatus" RENAME TO "ShipmentStatus_old";
ALTER TYPE "ShipmentStatus_new" RENAME TO "ShipmentStatus";
DROP TYPE "public"."ShipmentStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "WebhookEvent" DROP COLUMN "eventType",
ADD COLUMN     "eventType" "WebhookEventType" NOT NULL;
