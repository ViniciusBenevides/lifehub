ALTER TABLE "tasks" ADD COLUMN "recurring_source_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_recurring_source_id_tasks_id_fk" FOREIGN KEY ("recurring_source_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tasks_recurring_source_id_idx" ON "tasks" USING btree ("recurring_source_id");