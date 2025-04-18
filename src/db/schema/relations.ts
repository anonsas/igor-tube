import { relations } from "drizzle-orm";
import { videos } from "./videos";
import { users } from "./users";
import { categories } from "./categories";

export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  videos: many(videos),
}));

export const videoRelations = relations(videos, ({ one }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
}));
