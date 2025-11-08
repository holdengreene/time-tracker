import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

export const db = drizzle("file:sqlite.db");
