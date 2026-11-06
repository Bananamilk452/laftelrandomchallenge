import type { Category } from "./types";

export const queryKeys = {
  profiles: ["profiles"] as const,
  items: (category: Category, userId: number) =>
    ["items", category, userId] as const,
};
