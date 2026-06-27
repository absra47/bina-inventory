import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { CategoryManager } from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const rows = await db.select().from(categories).orderBy(asc(categories.name));
  return <CategoryManager categories={rows} />;
}
