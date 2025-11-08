import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { TimerStatus } from "~/types";
import { TIMER_STATUS } from "~/types/constants";

export const projectTable = sqliteTable("projects_table", {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    start: int().notNull(),
    end: int().default(sql`null`),
    totalTime: int().notNull().default(0),
    status: text().$type<TimerStatus>().notNull().default(TIMER_STATUS.RUNNING),
});
