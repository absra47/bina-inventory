import { db } from "@/lib/db";
import { items, categories, units } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { ItemManager } from "./ItemManager";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const [itemRows, categoryRows, unitRows] = await Promise.all([
    db
      .select({
        id: items.id,
        name: items.name,
        sku: items.sku,
        reorderLevel: items.reorderLevel,
        expiryTracked: items.expiryTracked,
        active: items.active,
        categoryId: items.categoryId,
        unitId: items.unitId,
        category: categories.name,
        unit: units.abbreviation,
      })
      .from(items)
      .leftJoin(categories, eq(items.categoryId, categories.id))
      .leftJoin(units, eq(items.unitId, units.id))
      .orderBy(asc(items.name)),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
    db.select({ id: units.id, name: units.name, abbreviation: units.abbreviation }).from(units).orderBy(asc(units.name)),
  ]);

  return <ItemManager items={itemRows} categories={categoryRows} units={unitRows} />;
}
