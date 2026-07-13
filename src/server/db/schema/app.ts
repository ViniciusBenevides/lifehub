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
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "done"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high"]);
export const projectStatusEnum = pgEnum("project_status", ["active", "completed", "archived"]);
export const noteCategoryEnum = pgEnum("note_category", [
  "estudo",
  "trabalho",
  "pessoal",
  "ideias",
  "tarefas",
  "reunioes",
]);
export const habitCategoryEnum = pgEnum("habit_category", [
  "saude",
  "produtividade",
  "bem_estar",
  "aprendizado",
  "fitness",
  "mindfulness",
  "social",
  "outro",
]);
export const moodEnum = pgEnum("mood", [
  "feliz",
  "calmo",
  "neutro",
  "triste",
  "ansioso",
  "irritado",
]);
export const birthdayRelationshipEnum = pgEnum("birthday_relationship", [
  "familia",
  "amigo",
  "trabalho",
  "relacionamento",
  "outro",
]);
export const pomodoroKindEnum = pgEnum("pomodoro_kind", ["focus", "short_break", "long_break"]);

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
    category: habitCategoryEnum("category"),
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

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").notNull().default("#3b82f6"),
    deadline: date("deadline"),
    status: projectStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("projects_user_id_idx").on(table.userId),
    index("projects_user_id_status_idx").on(table.userId, table.status),
  ],
);

export const taskCategories = pgTable(
  "task_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    icon: text("icon").notNull().default("📌"),
    color: text("color").notNull().default("#6366f1"),
    order: integer("order").notNull().default(0),
  },
  (table) => [index("task_categories_user_id_idx").on(table.userId)],
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    categoryId: uuid("category_id").references(() => taskCategories.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    notes: text("notes"),
    date: date("date").notNull(),
    // Hora opcional da tarefa (prazo dentro do dia).
    scheduledTime: time("scheduled_time"),
    tags: text("tags").array(),
    reminderEnabled: boolean("reminder_enabled").notNull().default(false),
    status: taskStatusEnum("status").notNull().default("todo"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    recurrenceRule: text("recurrence_rule"),
    // Aponta para a tarefa recorrente que originou esta ocorrência gerada.
    recurringSourceId: uuid("recurring_source_id").references((): AnyPgColumn => tasks.id, {
      onDelete: "cascade",
    }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    order: integer("order").notNull().default(0),
  },
  (table) => [
    index("tasks_user_id_date_idx").on(table.userId, table.date),
    index("tasks_goal_id_idx").on(table.goalId),
    index("tasks_project_id_idx").on(table.projectId),
    index("tasks_category_id_idx").on(table.categoryId),
    index("tasks_user_id_status_idx").on(table.userId, table.status),
    index("tasks_recurring_source_id_idx").on(table.recurringSourceId),
  ],
);

export const taskSubtasks = pgTable(
  "task_subtasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    done: boolean("done").notNull().default(false),
    order: integer("order").notNull().default(0),
  },
  (table) => [index("task_subtasks_task_id_idx").on(table.taskId)],
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: noteCategoryEnum("category").notNull().default("pessoal"),
    content: text("content").notNull().default(""),
    pinned: boolean("pinned").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("notes_user_id_idx").on(table.userId),
    index("notes_user_id_category_idx").on(table.userId, table.category),
  ],
);

export const studyPlans = pgTable(
  "study_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon").notNull().default("📚"),
    durationDays: integer("duration_days").notNull(),
    dailyGoalMinutes: integer("daily_goal_minutes").notNull(),
    startDate: date("start_date").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("study_plans_user_id_idx").on(table.userId)],
);

export const studySubjects = pgTable(
  "study_subjects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => studyPlans.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    minutesPerWeek: integer("minutes_per_week").notNull(),
    color: text("color").notNull().default("#6366f1"),
    order: integer("order").notNull().default(0),
  },
  (table) => [index("study_subjects_plan_id_idx").on(table.planId)],
);

export const studySessions = pgTable(
  "study_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planId: uuid("plan_id").references(() => studyPlans.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id").references(() => studySubjects.id, { onDelete: "set null" }),
    date: date("date").notNull(),
    minutes: integer("minutes").notNull(),
  },
  (table) => [index("study_sessions_user_id_date_idx").on(table.userId, table.date)],
);

export const pomodoroSessions = pgTable(
  "pomodoro_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "set null" }),
    kind: pomodoroKindEnum("kind").notNull().default("focus"),
    durationMinutes: integer("duration_minutes").notNull(),
    date: date("date").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("pomodoro_sessions_user_id_date_idx").on(table.userId, table.date)],
);

export const shoppingLists = pgTable(
  "shopping_lists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    done: boolean("done").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("shopping_lists_user_id_idx").on(table.userId)],
);

export const shoppingItems = pgTable(
  "shopping_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listId: uuid("list_id")
      .notNull()
      .references(() => shoppingLists.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull().default(1),
    priceCents: integer("price_cents"),
    purchased: boolean("purchased").notNull().default(false),
    order: integer("order").notNull().default(0),
  },
  (table) => [index("shopping_items_list_id_idx").on(table.listId)],
);

export const birthdays = pgTable(
  "birthdays",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    birthDate: date("birth_date").notNull(),
    relationship: birthdayRelationshipEnum("relationship").notNull().default("outro"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("birthdays_user_id_idx").on(table.userId)],
);

export const diaryEntries = pgTable(
  "diary_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    title: text("title"),
    content: text("content").notNull(),
    mood: moodEnum("mood"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("diary_entries_user_id_date_idx").on(table.userId, table.date)],
);

export const moodEntries = pgTable(
  "mood_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    mood: moodEnum("mood").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("mood_entries_user_id_date_uq").on(table.userId, table.date)],
);

export const dreamEntries = pgTable(
  "dream_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    lucid: boolean("lucid").notNull().default(false),
    nightmare: boolean("nightmare").notNull().default(false),
    // Clareza da lembrança do sonho (0–5).
    clarity: integer("clarity").notNull().default(3),
    mood: moodEnum("mood"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("dream_entries_user_id_date_idx").on(table.userId, table.date)],
);
