-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "NutritionContextType" AS ENUM ('PREGNANCY', 'BREASTFEEDING', 'CHILD');

-- CreateEnum
CREATE TYPE "ContextStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('WHATSAPP');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CampaignCategory" AS ENUM ('PREGNANCY', 'BREASTFEEDING', 'CHILD');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('REVIEW', 'REVISION', 'REJECTED', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVED', 'REVISION_REQUESTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_VERIFICATION', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('CREDIT_DONATION', 'DEBIT_WITHDRAWAL');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContactMessageStatus" AS ENUM ('UNREPLIED', 'REPLIED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "phone_number" VARCHAR(32),
    "phone_verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_contexts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "context_type" "NutritionContextType" NOT NULL,
    "label" VARCHAR(128),
    "status" "ContextStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "nutrition_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pregnancy_profiles" (
    "id" UUID NOT NULL,
    "context_id" UUID NOT NULL,
    "gestational_age_weeks" INTEGER,
    "pregnancy_index" INTEGER,
    "pre_pregnancy_weight" DECIMAL(5,2),
    "estimated_due_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pregnancy_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breastfeeding_profiles" (
    "id" UUID NOT NULL,
    "context_id" UUID NOT NULL,
    "baby_age_months" INTEGER,
    "delivery_date" DATE,
    "child_index" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "breastfeeding_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "child_profiles" (
    "id" UUID NOT NULL,
    "context_id" UUID NOT NULL,
    "child_name" VARCHAR(128),
    "gender" "Gender",
    "birth_date" DATE,
    "current_age_months" INTEGER,
    "birth_weight" DECIMAL(5,2),
    "birth_length" DECIMAL(5,2),
    "is_premature" BOOLEAN NOT NULL DEFAULT false,
    "gestational_age_at_birth" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "child_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_assessments" (
    "id" UUID NOT NULL,
    "context_id" UUID NOT NULL,
    "period_key" VARCHAR(16) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_baseline" BOOLEAN NOT NULL DEFAULT false,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'COMPLETED',
    "economic_data" JSONB,
    "health_data" JSONB,
    "environment_data" JSONB,
    "context_snapshot" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "nutrition_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_plans" (
    "id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category" "NutritionContextType" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "daily_budget" DECIMAL(12,2) NOT NULL,
    "target_nutrition" TEXT,
    "status" "PlanStatus" NOT NULL DEFAULT 'READY',
    "model_provider" VARCHAR(64),
    "model_name" VARCHAR(64),
    "adjustment_notes" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ready_at" TIMESTAMPTZ(6),

    CONSTRAINT "nutrition_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_recommendations" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "recommendation_date" DATE NOT NULL,
    "day_index" INTEGER NOT NULL,
    "total_calories" DECIMAL(7,2),
    "estimated_cost" DECIMAL(12,2) NOT NULL,
    "is_over_budget" BOOLEAN NOT NULL DEFAULT false,
    "daily_tips" TEXT,
    "meals_data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'WHATSAPP',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "preferred_time" VARCHAR(8),
    "timezone" VARCHAR(32) NOT NULL DEFAULT 'Asia/Jakarta',
    "consented_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "daily_recommendation_id" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'WHATSAPP',
    "provider_message_id" VARCHAR(128),
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "scheduled_at" TIMESTAMPTZ(6) NOT NULL,
    "sent_at" TIMESTAMPTZ(6),
    "delivered_at" TIMESTAMPTZ(6),
    "error_code" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_campaigns" (
    "id" UUID NOT NULL,
    "creator_user_id" UUID NOT NULL,
    "category" "CampaignCategory" NOT NULL,
    "applicant_name" VARCHAR(255) NOT NULL,
    "recipient_name" VARCHAR(255) NOT NULL,
    "whatsapp_number" VARCHAR(32) NOT NULL,
    "relationship" VARCHAR(64) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "story" TEXT NOT NULL,
    "health_condition_desc" TEXT NOT NULL,
    "economic_condition_desc" TEXT NOT NULL,
    "target_amount" DECIMAL(12,2) NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "thumbnail_url" TEXT,
    "documents" JSONB,
    "status" "CampaignStatus" NOT NULL DEFAULT 'REVIEW',
    "admin_note" TEXT,
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ(6),
    "deadline_at" TIMESTAMPTZ(6),
    "ended_at" TIMESTAMPTZ(6),
    "end_reason" VARCHAR(32),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "help_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_items" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "quantity" VARCHAR(64) NOT NULL,
    "estimated_cost" DECIMAL(12,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "campaign_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_reviews" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "admin_user_id" UUID NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "note" TEXT,
    "checklist" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" VARCHAR(32) NOT NULL,
    "campaign_id" UUID NOT NULL,
    "donor_user_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "donor_name" VARCHAR(255) NOT NULL,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "payment_method" VARCHAR(32) NOT NULL DEFAULT 'QRIS',
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "payment_submitted_at" TIMESTAMPTZ(6),
    "verified_by" UUID,
    "verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "recipient_name" VARCHAR(255) NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "transaction_type" "WalletTransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "reference_type" VARCHAR(32) NOT NULL,
    "reference_id" VARCHAR(64) NOT NULL,
    "description" TEXT NOT NULL,
    "balance_after" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" VARCHAR(32) NOT NULL,
    "wallet_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "bank_name" VARCHAR(128) NOT NULL,
    "account_number" VARCHAR(32) NOT NULL,
    "account_holder" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "processed_by" UUID,
    "processed_at" TIMESTAMPTZ(6),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255),
    "message" TEXT NOT NULL,
    "status" "ContactMessageStatus" NOT NULL DEFAULT 'UNREPLIED',
    "reply_text" TEXT,
    "replied_at" TIMESTAMPTZ(6),
    "replied_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_token_hash_idx" ON "user_sessions"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "nutrition_contexts_user_id_idx" ON "nutrition_contexts"("user_id");

-- CreateIndex
CREATE INDEX "nutrition_contexts_user_id_context_type_idx" ON "nutrition_contexts"("user_id", "context_type");

-- CreateIndex
CREATE UNIQUE INDEX "pregnancy_profiles_context_id_key" ON "pregnancy_profiles"("context_id");

-- CreateIndex
CREATE UNIQUE INDEX "breastfeeding_profiles_context_id_key" ON "breastfeeding_profiles"("context_id");

-- CreateIndex
CREATE UNIQUE INDEX "child_profiles_context_id_key" ON "child_profiles"("context_id");

-- CreateIndex
CREATE INDEX "nutrition_assessments_context_id_idx" ON "nutrition_assessments"("context_id");

-- CreateIndex
CREATE INDEX "nutrition_assessments_context_id_period_key_idx" ON "nutrition_assessments"("context_id", "period_key");

-- CreateIndex
CREATE INDEX "nutrition_assessments_created_at_idx" ON "nutrition_assessments"("created_at");

-- CreateIndex
CREATE INDEX "nutrition_plans_assessment_id_idx" ON "nutrition_plans"("assessment_id");

-- CreateIndex
CREATE INDEX "nutrition_plans_user_id_idx" ON "nutrition_plans"("user_id");

-- CreateIndex
CREATE INDEX "nutrition_plans_status_idx" ON "nutrition_plans"("status");

-- CreateIndex
CREATE INDEX "nutrition_plans_period_start_idx" ON "nutrition_plans"("period_start");

-- CreateIndex
CREATE INDEX "daily_recommendations_plan_id_idx" ON "daily_recommendations"("plan_id");

-- CreateIndex
CREATE INDEX "daily_recommendations_recommendation_date_idx" ON "daily_recommendations"("recommendation_date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_recommendations_plan_id_recommendation_date_key" ON "daily_recommendations"("plan_id", "recommendation_date");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_channel_key" ON "notification_preferences"("user_id", "channel");

-- CreateIndex
CREATE INDEX "notification_deliveries_status_idx" ON "notification_deliveries"("status");

-- CreateIndex
CREATE INDEX "notification_deliveries_scheduled_at_idx" ON "notification_deliveries"("scheduled_at");

-- CreateIndex
CREATE INDEX "notification_deliveries_user_id_idx" ON "notification_deliveries"("user_id");

-- CreateIndex
CREATE INDEX "notification_deliveries_daily_recommendation_id_idx" ON "notification_deliveries"("daily_recommendation_id");

-- CreateIndex
CREATE INDEX "help_campaigns_status_idx" ON "help_campaigns"("status");

-- CreateIndex
CREATE INDEX "help_campaigns_category_idx" ON "help_campaigns"("category");

-- CreateIndex
CREATE INDEX "help_campaigns_creator_user_id_idx" ON "help_campaigns"("creator_user_id");

-- CreateIndex
CREATE INDEX "campaign_items_campaign_id_idx" ON "campaign_items"("campaign_id");

-- CreateIndex
CREATE INDEX "campaign_reviews_campaign_id_idx" ON "campaign_reviews"("campaign_id");

-- CreateIndex
CREATE INDEX "campaign_reviews_admin_user_id_idx" ON "campaign_reviews"("admin_user_id");

-- CreateIndex
CREATE INDEX "donations_campaign_id_idx" ON "donations"("campaign_id");

-- CreateIndex
CREATE INDEX "donations_status_idx" ON "donations"("status");

-- CreateIndex
CREATE INDEX "donations_payment_submitted_at_idx" ON "donations"("payment_submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_wallet_id_idx" ON "wallet_transactions"("wallet_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_reference_type_reference_id_key" ON "wallet_transactions"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "withdrawals_wallet_id_idx" ON "withdrawals"("wallet_id");

-- CreateIndex
CREATE INDEX "withdrawals_user_id_idx" ON "withdrawals"("user_id");

-- CreateIndex
CREATE INDEX "withdrawals_status_idx" ON "withdrawals"("status");

-- CreateIndex
CREATE INDEX "contact_messages_status_idx" ON "contact_messages"("status");

-- CreateIndex
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at");

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_contexts" ADD CONSTRAINT "nutrition_contexts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancy_profiles" ADD CONSTRAINT "pregnancy_profiles_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "nutrition_contexts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breastfeeding_profiles" ADD CONSTRAINT "breastfeeding_profiles_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "nutrition_contexts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_profiles" ADD CONSTRAINT "child_profiles_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "nutrition_contexts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_assessments" ADD CONSTRAINT "nutrition_assessments_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "nutrition_contexts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_plans" ADD CONSTRAINT "nutrition_plans_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "nutrition_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_plans" ADD CONSTRAINT "nutrition_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_recommendations" ADD CONSTRAINT "daily_recommendations_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "nutrition_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_daily_recommendation_id_fkey" FOREIGN KEY ("daily_recommendation_id") REFERENCES "daily_recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_campaigns" ADD CONSTRAINT "help_campaigns_creator_user_id_fkey" FOREIGN KEY ("creator_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_items" ADD CONSTRAINT "campaign_items_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "help_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_reviews" ADD CONSTRAINT "campaign_reviews_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "help_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_reviews" ADD CONSTRAINT "campaign_reviews_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "help_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_user_id_fkey" FOREIGN KEY ("donor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_replied_by_fkey" FOREIGN KEY ("replied_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
