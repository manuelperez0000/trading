import { readFile } from "node:fs/promises";
import pool from "../config/database.js";

const migrationUrls = [
  new URL("../migrations/001_social_graph.sql", import.meta.url),
  new URL("../migrations/002_post_comments.sql", import.meta.url),
];

export async function initializeSocialTables() {
  for (const migrationUrl of migrationUrls) {
    const migration = await readFile(migrationUrl, "utf8");
    await pool.query(migration);
  }
}
