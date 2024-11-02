import { bigint, mysqlTable, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

// User table Drizzle schema
export const users = mysqlTable("users", {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    username: varchar("username", { length: 256 }).notNull().unique(),
    email: varchar("email", { length: 256 }).notNull().unique(),
    password: varchar("password", { length: 256 }).notNull(),
    role: varchar("role", { length: 256 }).notNull().default("user"),
    email_verified: boolean("email_verified").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});