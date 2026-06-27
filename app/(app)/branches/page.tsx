import { db } from "@/lib/db";
import { branches } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { BranchManager } from "./BranchManager";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const rows = await db.select().from(branches).orderBy(asc(branches.name));
  return <BranchManager branches={rows} />;
}
