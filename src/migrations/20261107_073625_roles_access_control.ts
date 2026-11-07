import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

import { createPresetRoles } from '../access/presets'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_roles_permissions_results" AS ENUM('none', 'read', 'edit', 'full');
  CREATE TYPE "public"."enum_roles_permissions_services" AS ENUM('none', 'read', 'edit', 'full');
  CREATE TYPE "public"."enum_roles_permissions_posts" AS ENUM('none', 'read', 'edit', 'full');
  CREATE TYPE "public"."enum_roles_permissions_categories" AS ENUM('none', 'read', 'edit', 'full');
  CREATE TYPE "public"."enum_roles_permissions_testimonials" AS ENUM('none', 'read', 'edit', 'full');
  CREATE TYPE "public"."enum_roles_permissions_media" AS ENUM('none', 'read', 'edit', 'full');
  CREATE TYPE "public"."enum_roles_permissions_leads" AS ENUM('none', 'read', 'edit', 'full');
  CREATE TYPE "public"."enum_roles_permissions_site_settings" AS ENUM('none', 'read', 'edit');
  CREATE TABLE "roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"permissions_results" "enum_roles_permissions_results" DEFAULT 'none' NOT NULL,
  	"permissions_services" "enum_roles_permissions_services" DEFAULT 'none' NOT NULL,
  	"permissions_posts" "enum_roles_permissions_posts" DEFAULT 'none' NOT NULL,
  	"permissions_categories" "enum_roles_permissions_categories" DEFAULT 'none' NOT NULL,
  	"permissions_testimonials" "enum_roles_permissions_testimonials" DEFAULT 'none' NOT NULL,
  	"permissions_media" "enum_roles_permissions_media" DEFAULT 'none' NOT NULL,
  	"permissions_leads" "enum_roles_permissions_leads" DEFAULT 'none' NOT NULL,
  	"permissions_site_settings" "enum_roles_permissions_site_settings" DEFAULT 'none' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "roles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  ALTER TABLE "users" ADD COLUMN "owner" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN "role_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "roles_id" integer;
  ALTER TABLE "roles_rels" ADD CONSTRAINT "roles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "roles_rels" ADD CONSTRAINT "roles_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "roles_name_idx" ON "roles" USING btree ("name");
  CREATE INDEX "roles_updated_at_idx" ON "roles" USING btree ("updated_at");
  CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");
  CREATE INDEX "roles_rels_order_idx" ON "roles_rels" USING btree ("order");
  CREATE INDEX "roles_rels_parent_idx" ON "roles_rels" USING btree ("parent_id");
  CREATE INDEX "roles_rels_path_idx" ON "roles_rels" USING btree ("path");
  CREATE INDEX "roles_rels_services_id_idx" ON "roles_rels" USING btree ("services_id");
  ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_role_idx" ON "users" USING btree ("role_id");
  CREATE INDEX "payload_locked_documents_rels_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("roles_id");`)

  // Everyone who could log in before roles existed keeps full access as an owner.
  await db.execute(sql`UPDATE "users" SET "owner" = true;`)

  // Starting roles (Website Designer, SEO Specialist, …) that the owner can edit or delete.
  await createPresetRoles(payload, req)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "roles_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "roles" CASCADE;
  DROP TABLE "roles_rels" CASCADE;
  ALTER TABLE "users" DROP CONSTRAINT "users_role_id_roles_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_roles_fk";
  
  DROP INDEX "users_role_idx";
  DROP INDEX "payload_locked_documents_rels_roles_id_idx";
  ALTER TABLE "users" DROP COLUMN "owner";
  ALTER TABLE "users" DROP COLUMN "role_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "roles_id";
  DROP TYPE "public"."enum_roles_permissions_results";
  DROP TYPE "public"."enum_roles_permissions_services";
  DROP TYPE "public"."enum_roles_permissions_posts";
  DROP TYPE "public"."enum_roles_permissions_categories";
  DROP TYPE "public"."enum_roles_permissions_testimonials";
  DROP TYPE "public"."enum_roles_permissions_media";
  DROP TYPE "public"."enum_roles_permissions_leads";
  DROP TYPE "public"."enum_roles_permissions_site_settings";`)
}
