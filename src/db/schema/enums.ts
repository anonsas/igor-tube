import { pgEnum } from "drizzle-orm/pg-core";

export const videoVisibility = pgEnum("video_visibility", ["private", "public"]);
