import { pgTable, timestamp, text, numeric, serial, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // pode usar UUID ou email
  name: text("name"),
  email: text("email").unique(),
  password: text("password").notNull(),
  is_logged_in: boolean("is_logged_in").default(false), // "true" | "false"
  asigned_pending: boolean("asigned_pending").default(false), // "true" | "false"
  create_at: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),

  user_id: text("user_id").references(() => users.id), // relacionamento com a tabela de usuários

  type: text("type"), // "income" | "expense"

  description: text("description"),

  amount: numeric("amount"),

  category: text("category"),

  payment_method: text("payment_method"),

  date: timestamp("date"),

  create_at: timestamp("created_at").defaultNow(),
});

export const debtors = pgTable("debtors", {
  id: serial("id").primaryKey(),

  user_id: text("user_id").references(() => users.id),

  name: text("name"),

  description: text("description"),

  amount: numeric("amount"),

  due_date: timestamp("due_date"),

  status: text("status"), // "pending" | "paid" | "late"

  create_at: timestamp("created_at").defaultNow(),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),

  userId: text("user_id"),

  amount: numeric("amount"),

  total15: numeric("total_15"),

  total30: numeric("total_30"),

  status: text("status"), // "simulated" | "requested" | "approved"

  create_at: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),

  user_id: text("user_id"),

  sender: text("sender"), // "user" | "bot"

  message: text("message"),

  create_at: timestamp("created_at").defaultNow(),
});
