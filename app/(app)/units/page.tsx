import { db } from "@/lib/db";
import { units } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { UnitManager } from "./UnitManager";

export const dynamic = "force-dynamic";

export default async function UnitsPage() {
  const rows = await db.select().from(units).orderBy(asc(units.name));
  return <UnitManager units={rows} />;
}
