import { db } from "@/lib/db";
import { users, branches } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { UserManager } from "./UserManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [userRows, branchRows] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        active: users.active,
        createdAt: users.createdAt,
        branchId: users.branchId,
        branch: branches.name,
      })
      .from(users)
      .leftJoin(branches, eq(users.branchId, branches.id))
      .orderBy(asc(users.name)),
    db.select({ id: branches.id, name: branches.name }).from(branches).orderBy(asc(branches.name)),
  ]);

  return <UserManager users={userRows} branches={branchRows} />;
}
