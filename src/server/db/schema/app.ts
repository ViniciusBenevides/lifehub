import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const goalStatusEnum = pgEnum("goal_status", ["active", "completed", "paused", "archived"]);
export const goalProgressTypeEnum = pgEnum("goal_progress_type", [
  "manual_percent",
  "milestones",
  "numeric",
]);
export const habitFrequencyTypeEnum = pgEnum("habit_frequency_type", [
  "daily",
  "weekly_days",
  "times_per_week",
]);
export const timeOfDayEnum = pgEnum("time_of_day", ["morning", "afternoon", "evening", "anytime"]);
export const categoryTypeEnum = pgEnum("category_type", ["income", "expense"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);
export const dreamStatusEnum = pgEnum("dream_status", ["dreaming", "in_progress", "achieved"]);
export const taskStatusEnum = pgEnum("task_status", ["todo", "done"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high"]);

export const lifeAreas = pgTable(
  "life_areas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    icon: text("icon").notNull(),
    color: text("color").notNull(),
    order: integer("order").notNull().default(0),
  },
  (table) => [index("life_areas_user_id_idx").on(table.userId)],
);

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lifeAreaId: uuid("life_area_id")
      .notNull()
      .references(() => lifeAreas.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    targetDate: date("target_date"),
    status: goalStatusEnum("status").notNull().default("active"),
    progressType: goalProgressTypeEnum("progress_type").notNull(),
    targetValue: integer("target_value"),
    currentValue: integer("current_value").notNull().default(0),
    unit: text("unit"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("goals_user_id_idx").on(table.userId),
    index("goals_life_area_id_idx").on(table.lifeAreaId),
    index("goals_user_id_status_idx").on(table.userId, table.status),
  ],
);

export const goalMilestones = pgTable(
  "goal_milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    done: boolean("done").notNull().default(false),
    order: integer("order").notNull().default(0),
    dueDate: date("due_date"),
  },
  (table) => [index("goal_milestones_goal_id_idx").on(table.goalId)],
);

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    icon: text("icon"),
    color: text("color"),
    frequencyType: habitFrequencyTypeEnum("frequency_type").notNull(),
    // Dias da semana (0 = domingo … 6 = sábado) quando frequencyType = weekly_days.
    weeklyDays: integer("weekly_days").array(),
    timesPerWeek: integer("times_per_week"),
    timeOfDay: timeOfDayEnum("time_of_day").notNull().default("anytime"),
    reminderTime: time("reminder_time"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("habits_user_id_idx").on(table.userId),
    index("habits_goal_id_idx").on(table.goalId),
    index("habits_user_id_active_idx").on(table.userId, table.active),
  ],
);

export const habitLogs = pgTable(
  "habit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("habit_logs_habit_id_date_uq").on(table.habitId, table.date),
    index("habit_logs_date_idx").on(table.date),
  ],
);

export const transactionCategories = pgTable(
  "transaction_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    icon: text("icon"),
    color: text("color"),
    type: categoryTypeEnum("type").notNull(),
  },
  (table) => [index("transaction_categories_user_id_idx").on(table.userId)],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => transactionCategories.id, { onDelete: "restrict" }),
    description: text("description").notNull(),
    // Dinheiro sempre em centavos (integer) — nunca float.
    amountCents: integer("amount_cents").notNull(),
    type: transactionTypeEnum("type").notNull(),
    date: date("date").notNull(),
    isRecurring: boolean("is_recurring").notNull().default(false),
    recurrenceRule: text("recurrence_rule"),
    // Aponta para a transação recorrente que originou esta ocorrência gerada.
    recurringSourceId: uuid("recurring_source_id").references((): AnyPgColumn => transactions.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("transactions_user_id_idx").on(table.userId),
    index("transactions_category_id_idx").on(table.categoryId),
    index("transactions_user_id_date_idx").on(table.userId, table.date),
    index("transactions_recurring_source_id_idx").on(table.recurringSourceId),
  ],
);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => transactionCategories.id, { onDelete: "cascade" }),
    // Mês no formato "YYYY-MM".
    month: text("month").notNull(),
    limitCents: integer("limit_cents").notNull(),
  },
  (table) => [
    uniqueIndex("budgets_user_category_month_uq").on(table.userId, table.categoryId, table.month),
    index("budgets_user_id_month_idx").on(table.userId, table.month),
  ],
);

export const dreams = pgTable(
  "dreams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    estimatedCostCents: integer("estimated_cost_cents"),
    targetDate: date("target_date"),
    status: dreamStatusEnum("status").notNull().default("dreaming"),
    linkedGoalId: uuid("linked_goal_id").references(() => goals.id, { onDelete: "set null" }),
    order: integer("order").notNull().default(0),
  },
  (table) => [
    index("dreams_user_id_idx").on(table.userId),
    index("dreams_linked_goal_id_idx").on(table.linkedGoalId),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    notes: text("notes"),
    date: date("date").notNull(),
    status: taskStatusEnum("status").notNull().default("todo"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    recurrenceRule: text("recurrence_rule"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    order: integer("order").notNull().default(0),
  },
  (table) => [
    index("tasks_user_id_date_idx").on(table.userId, table.date),
    index("tasks_goal_id_idx").on(table.goalId),
    index("tasks_user_id_status_idx").on(table.userId, table.status),
  ],
);
