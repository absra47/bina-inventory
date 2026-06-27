import { db } from "./index";
import {
  branches, users, categories, units, items,
  stockIns, stockInLines, issues, issueLines,
} from "./schema";
import { createId } from "../id";
import bcrypt from "bcryptjs";

const ADMIN_HASH = bcrypt.hashSync("admin123", 10);

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9 + (n % 8), 15, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding…");

  // wipe (order matters for FKs)
  await db.delete(issueLines);
  await db.delete(issues);
  await db.delete(stockInLines);
  await db.delete(stockIns);
  await db.delete(items);
  await db.delete(units);
  await db.delete(categories);
  await db.delete(users);
  await db.delete(branches);

  // Branches
  const branchRows = [
    { id: createId(), name: "Bole Branch", code: "BR-BOLE", location: "Bole, Addis Ababa", phone: "+251911000001", active: true, createdAt: daysAgo(120), email: "bole@bina.et" },
    { id: createId(), name: "Piassa Branch", code: "BR-PIASSA", location: "Piassa, Addis Ababa", phone: "+251911000002", active: true, createdAt: daysAgo(118), email: "piassa@bina.et" },
    { id: createId(), name: "Megenagna Branch", code: "BR-MEGEN", location: "Megenagna, Addis Ababa", phone: "+251911000003", active: true, createdAt: daysAgo(90), email: "megenagna@bina.et" },
    { id: createId(), name: "CMC Branch", code: "BR-CMC", location: "CMC, Addis Ababa", phone: "+251911000004", active: false, createdAt: daysAgo(60), email: "cmc@bina.et" },
  ];
  await db.insert(branches).values(branchRows);

  // Users
  const adminId = createId();
  await db.insert(users).values([
    { id: adminId, name: "Tsedenya Adnew", email: "admin@bina.et", password: ADMIN_HASH, role: "ADMIN", active: true, branchId: null, createdAt: daysAgo(120) },
    { id: createId(), name: "Mahlet W.", email: "mahlet@bina.et", password: ADMIN_HASH, role: "MANAGER", active: true, branchId: branchRows[0].id, createdAt: daysAgo(100) },
  ]);

  // Categories
  const catRows = ["Dry Goods", "Beverages", "Dairy", "Produce", "Cleaning", "Packaging"].map((name) => ({ id: createId(), name }));
  await db.insert(categories).values(catRows);
  const cat = (n: string) => catRows.find((c) => c.name === n)!.id;

  // Units
  const unitRows = [
    { id: createId(), name: "Kilogram", abbreviation: "kg" },
    { id: createId(), name: "Litre", abbreviation: "L" },
    { id: createId(), name: "Piece", abbreviation: "pc" },
    { id: createId(), name: "Carton", abbreviation: "ctn" },
    { id: createId(), name: "Pack", abbreviation: "pk" },
  ];
  await db.insert(units).values(unitRows);
  const unit = (a: string) => unitRows.find((u) => u.abbreviation === a)!.id;

  // Items
  const itemDefs: [string, string, string, string, boolean][] = [
    ["Rice (Premium)", "ITM-RICE", "Dry Goods", "kg", false],
    ["Wheat Flour", "ITM-FLOUR", "Dry Goods", "kg", false],
    ["Cooking Oil", "ITM-OIL", "Dry Goods", "L", true],
    ["Sugar", "ITM-SUGAR", "Dry Goods", "kg", false],
    ["Bottled Water 1L", "ITM-WATER", "Beverages", "ctn", false],
    ["Soft Drink 300ml", "ITM-SODA", "Beverages", "ctn", true],
    ["Fresh Milk", "ITM-MILK", "Dairy", "L", true],
    ["Cheese", "ITM-CHEESE", "Dairy", "kg", true],
    ["Tomato", "ITM-TOMATO", "Produce", "kg", true],
    ["Onion", "ITM-ONION", "Produce", "kg", false],
    ["Dish Soap", "ITM-SOAP", "Cleaning", "pc", false],
    ["Takeaway Box", "ITM-BOX", "Packaging", "pk", false],
  ];
  const itemRows = itemDefs.map(([name, sku, c, u, exp]) => ({
    id: createId(), name, sku, categoryId: cat(c), unitId: unit(u),
    reorderLevel: 20, expiryTracked: exp, active: true, createdAt: daysAgo(110),
  }));
  await db.insert(items).values(itemRows);
  const item = (sku: string) => itemRows.find((i) => i.sku === sku)!;

  // A stock-in (supplier delivery into main store)
  const siId = createId();
  await db.insert(stockIns).values([{ id: siId, reference: "GRN-2026-001", supplier: "Habesha Wholesalers", date: daysAgo(20), totalValue: 152000 }]);
  await db.insert(stockInLines).values([
    { id: createId(), stockInId: siId, itemId: item("ITM-RICE").id, quantity: 500, unitCost: 95, expiryDate: null },
    { id: createId(), stockInId: siId, itemId: item("ITM-OIL").id, quantity: 300, unitCost: 210, expiryDate: daysAgo(-180) },
    { id: createId(), stockInId: siId, itemId: item("ITM-SUGAR").id, quantity: 400, unitCost: 75, expiryDate: null },
  ]);

  // ---- Issues (main store -> branch). Build 25 receipts matching the reference report:
  //   25 total, 22 fully received (1 of them partial), 2 with rejected line items (3 lines rejected),
  //   739 received of 759 issued, 97.4% acceptance.
  const reqUsers = [adminId];
  const issueRows: (typeof issues.$inferInsert)[] = [];
  const lineRows: (typeof issueLines.$inferInsert)[] = [];

  // Helper to push an issue with given lines
  let counter = 1;
  function makeIssue(opts: {
    dayOffset: number;
    branchIdx: number;
    status: "RECEIVED" | "PARTIAL" | "REJECTED";
    lines: { sku: string; issued: number; received: number; rejected: number }[];
  }) {
    const id = createId();
    issueRows.push({
      id,
      reference: `ISS-2026-${String(counter).padStart(4, "0")}`,
      branchId: branchRows[opts.branchIdx % branchRows.length].id,
      requestedById: reqUsers[0],
      status: opts.status,
      issuedAt: daysAgo(opts.dayOffset),
      receivedAt: daysAgo(opts.dayOffset - 1),
    });
    counter++;
    for (const l of opts.lines) {
      const lineStatus = l.rejected > 0 ? "REJECTED" : l.received < l.issued ? "PARTIAL" : "RECEIVED";
      lineRows.push({
        id: createId(),
        issueId: id,
        itemId: item(l.sku).id,
        qtyIssued: l.issued,
        qtyReceived: l.received,
        qtyRejected: l.rejected,
        unitCost: 100,
        status: lineStatus,
      });
    }
  }

  const skus = itemRows.map((i) => i.sku);
  const pick = (n: number) => skus[n % skus.length];

  // 22 clean fully-received issues. Distribute qty so totals land near target.
  // We'll explicitly control totals below.
  let totalIssued = 0;
  let totalReceived = 0;

  // 22 fully received issues (received == issued). True-up the last one so the
  // fully-received subtotal is exactly 654 (=> grand total issued 759, received 739).
  const TARGET_FULL = 654;
  const fullCount = 22;
  const fullIssues: { q1: number; q2: number; k: number }[] = [];
  let runFull = 0;
  for (let k = 0; k < fullCount - 1; k++) {
    const q1 = 12 + (k % 9);
    const q2 = 8 + (k % 5);
    fullIssues.push({ q1, q2, k });
    runFull += q1 + q2;
  }
  // last one trues up the remainder
  const remainder = TARGET_FULL - runFull;
  fullIssues.push({ q1: Math.max(1, remainder - 5), q2: 5, k: fullCount - 1 });

  for (const f of fullIssues) {
    makeIssue({
      dayOffset: 1 + (f.k % 24),
      branchIdx: f.k,
      status: "RECEIVED",
      lines: [
        { sku: pick(f.k), issued: f.q1, received: f.q1, rejected: 0 },
        { sku: pick(f.k + 3), issued: f.q2, received: f.q2, rejected: 0 },
      ],
    });
    totalIssued += f.q1 + f.q2;
    totalReceived += f.q1 + f.q2;
  }

  // 1 partial (counts toward "1 partial"): received < issued, no rejects
  makeIssue({
    dayOffset: 5,
    branchIdx: 1,
    status: "PARTIAL",
    lines: [
      { sku: pick(2), issued: 30, received: 20, rejected: 0 }, // 10 short
      { sku: pick(4), issued: 15, received: 15, rejected: 0 },
    ],
  });
  totalIssued += 45;
  totalReceived += 35;

  // 2 issues with rejected line items -> 3 line items rejected total
  makeIssue({
    dayOffset: 8,
    branchIdx: 2,
    status: "REJECTED",
    lines: [
      { sku: pick(6), issued: 20, received: 16, rejected: 4 }, // rejected line
      { sku: pick(7), issued: 10, received: 10, rejected: 0 },
    ],
  });
  totalIssued += 30;
  totalReceived += 26;

  makeIssue({
    dayOffset: 12,
    branchIdx: 3,
    status: "REJECTED",
    lines: [
      { sku: pick(8), issued: 18, received: 15, rejected: 3 },  // rejected line
      { sku: pick(9), issued: 12, received: 9, rejected: 3 },   // rejected line
    ],
  });
  totalIssued += 30;
  totalReceived += 24;

  await db.insert(issues).values(issueRows);
  await db.insert(issueLines).values(lineRows);

  console.log(`Issues: ${issueRows.length}  |  Issued qty: ${totalIssued}  Received qty: ${totalReceived}  |  Acceptance: ${((totalReceived / totalIssued) * 100).toFixed(1)}%`);
  console.log("Done. Login: admin@bina.et / admin123");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
