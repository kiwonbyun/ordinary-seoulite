import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const schema = readFileSync("supabase/schema.sql", "utf-8");

describe("supabase schema", () => {
  it("creates core tables", () => {
    expect(schema).toMatch(/create table if not exists board_posts/i);
    expect(schema).toMatch(/create table if not exists dm_threads/i);
    expect(schema).toMatch(/create table if not exists gallery_photos/i);
  });

  it("stores board post type with question as default", () => {
    expect(schema).toMatch(/type text not null default 'question'/i);
    expect(schema).toMatch(/check \(type in \('question', 'review', 'tip'\)\)/i);
  });
});
