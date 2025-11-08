import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projectTable = sqliteTable("projects_table", {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    start: text("timestamp").default(sql`(current_timestamp)`),
    end: text().default(sql`null`),
});
