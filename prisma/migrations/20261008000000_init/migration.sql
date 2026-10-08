-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BenefitType" AS ENUM ('free_item', 'discount_percent', 'discount_amount', 'points', 'free_entry', 'other');

-- CreateEnum
CREATE TYPE "PromoWindow" AS ENUM ('day', 'week', 'month');

-- CreateEnum
CREATE TYPE "VerifyMethod" AS ENUM ('auto', 'manual');

-- CreateEnum
CREATE TYPE "PromoStatus" AS ENUM ('draft', 'published', 'hidden', 'expired');

-- CreateEnum
CREATE TYPE "FeedbackReason" AS ENUM ('wrong_info', 'store_refused', 'expired', 'other');

-- CreateTable
CREATE TABLE "Brand" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" UUID NOT NULL,
    "brandId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "benefit" TEXT NOT NULL,
    "benefitType" "BenefitType" NOT NULL,
    "window" "PromoWindow" NOT NULL,
    "windowDaysBefore" INTEGER NOT NULL DEFAULT 0,
    "windowDaysAfter" INTEGER NOT NULL DEFAULT 0,
    "tiers" JSONB,
    "requiresMembership" BOOLEAN NOT NULL DEFAULT false,
    "membershipName" TEXT,
    "requiredTier" TEXT,
    "signupLeadDays" INTEGER NOT NULL DEFAULT 0,
    "minSpend" DECIMAL(65,30),
    "conditions" TEXT[],
    "channels" TEXT[],
    "excludedBranches" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "sourceSnapshotUrl" TEXT,
    "howToRedeem" TEXT[],
    "requiredDocs" TEXT[],
    "verifyMethod" "VerifyMethod" NOT NULL,
    "brandVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "PromoStatus" NOT NULL DEFAULT 'draft',
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionRevision" (
    "id" UUID NOT NULL,
    "promotionId" UUID NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceSnapshot" (
    "id" UUID NOT NULL,
    "promotionId" UUID NOT NULL,
    "contentHash" TEXT NOT NULL,
    "httpStatus" INTEGER,
    "diffDetected" BOOLEAN NOT NULL DEFAULT false,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoFeedback" (
    "id" UUID NOT NULL,
    "promotionId" UUID NOT NULL,
    "userId" UUID,
    "stillValid" BOOLEAN NOT NULL,
    "reason" "FeedbackReason",
    "note" TEXT,
    "branch" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" UUID NOT NULL,
    "payload" JSONB NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "lineUserId" TEXT NOT NULL,
    "birthMonth" INTEGER NOT NULL,
    "birthDay" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "purpose" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Promotion_brandId_idx" ON "Promotion"("brandId");

-- CreateIndex
CREATE INDEX "Promotion_status_window_idx" ON "Promotion"("status", "window");

-- CreateIndex
CREATE INDEX "PromotionRevision_promotionId_createdAt_idx" ON "PromotionRevision"("promotionId", "createdAt");

-- CreateIndex
CREATE INDEX "SourceSnapshot_promotionId_fetchedAt_idx" ON "SourceSnapshot"("promotionId", "fetchedAt");

-- CreateIndex
CREATE INDEX "PromoFeedback_promotionId_createdAt_idx" ON "PromoFeedback"("promotionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_lineUserId_key" ON "User"("lineUserId");

-- CreateIndex
CREATE INDEX "ConsentLog_userId_purpose_createdAt_idx" ON "ConsentLog"("userId", "purpose", "createdAt");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRevision" ADD CONSTRAINT "PromotionRevision_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceSnapshot" ADD CONSTRAINT "SourceSnapshot_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoFeedback" ADD CONSTRAINT "PromoFeedback_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentLog" ADD CONSTRAINT "ConsentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase: ปิดการเข้าถึงผ่าน Data API (anon/authenticated) ทุกตาราง; Prisma ใช้ role postgres จึงไม่โดนบล็อก
ALTER TABLE "Brand" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Promotion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PromotionRevision" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SourceSnapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PromoFeedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Submission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsentLog" ENABLE ROW LEVEL SECURITY;
