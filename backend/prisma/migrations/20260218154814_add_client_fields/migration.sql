-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "clientPhone" TEXT,
ADD COLUMN     "pickupDate" TIMESTAMP(3);
