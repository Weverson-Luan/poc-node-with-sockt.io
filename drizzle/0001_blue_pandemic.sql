ALTER TABLE "users" ADD COLUMN "password" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_logged_in" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "asigned_pending" boolean DEFAULT false;