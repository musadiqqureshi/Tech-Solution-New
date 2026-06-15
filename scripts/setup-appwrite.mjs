#!/usr/bin/env node
/**
 * Idempotent Appwrite provisioning for Tech Solutions Pakistan — Stage 1.
 *
 * Creates the database, collections (with attributes + indexes), storage
 * buckets, and seeds the experts directory. Safe to re-run: anything that
 * already exists is skipped.
 *
 * Usage:
 *   1. Create an API key in the Appwrite console with scopes:
 *        databases.read/write, collections.read/write,
 *        attributes.read/write, indexes.read/write,
 *        buckets.read/write, documents.read/write
 *   2. Set env vars (or put them in .env.local — see below) and run:
 *        APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 \
 *        APPWRITE_PROJECT_ID=xxx \
 *        APPWRITE_API_KEY=xxx \
 *        node scripts/setup-appwrite.mjs
 *   Or, with values already in .env.local:
 *        npm run setup:appwrite
 */

import { readFileSync } from "node:fs";
import {
  Client,
  Databases,
  Storage,
  Permission,
  Role,
  ID,
  IndexType,
} from "node-appwrite";

// ── Load .env.local (so npm run setup:appwrite "just works") ──────────────
function loadDotEnv(path = ".env.local") {
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2].replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    /* no .env.local — rely on real env vars */
  }
}
loadDotEnv();

const ENDPOINT =
  process.env.APPWRITE_ENDPOINT ||
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
  "https://cloud.appwrite.io/v1";
const PROJECT_ID =
  process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tsp_main";

if (!PROJECT_ID || !API_KEY) {
  console.error(
    "✗ Missing APPWRITE_PROJECT_ID and/or APPWRITE_API_KEY.\n" +
      "  Set them as env vars (the API key is server-only — never commit it)."
  );
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

// ── Helpers (swallow 409 "already exists") ────────────────────────────────
const ok = (label) => console.log(`  ✓ ${label}`);
const skip = (label) => console.log(`  • ${label} (exists)`);

async function step(label, fn) {
  try {
    await fn();
    ok(label);
  } catch (e) {
    if (e?.code === 409) skip(label);
    else throw e;
  }
}

// String/enum/bool/array attribute creators wrapped for idempotency.
const attr = {
  string: (cid, key, size, required = false, array = false) =>
    step(`attr ${cid}.${key}`, () =>
      databases.createStringAttribute(DB_ID, cid, key, size, required, undefined, array)
    ),
  email: (cid, key, required = false) =>
    step(`attr ${cid}.${key}`, () =>
      databases.createEmailAttribute(DB_ID, cid, key, required)
    ),
  bool: (cid, key, required = false, def = undefined) =>
    step(`attr ${cid}.${key}`, () =>
      databases.createBooleanAttribute(DB_ID, cid, key, required, def)
    ),
  enum: (cid, key, vals, required = false, def = undefined) =>
    step(`attr ${cid}.${key}`, () =>
      databases.createEnumAttribute(DB_ID, cid, key, vals, required, def)
    ),
  datetime: (cid, key, required = false) =>
    step(`attr ${cid}.${key}`, () =>
      databases.createDatetimeAttribute(DB_ID, cid, key, required)
    ),
  float: (cid, key, required = false) =>
    step(`attr ${cid}.${key}`, () =>
      databases.createFloatAttribute(DB_ID, cid, key, required)
    ),
};

const index = (cid, key, attributes, type = IndexType.Key) =>
  step(`index ${cid}.${key}`, () =>
    databases.createIndex(DB_ID, cid, key, type, attributes)
  );

// Wait until newly-created attributes are 'available' before adding indexes.
async function waitForAttributes(cid) {
  for (let i = 0; i < 20; i++) {
    const { attributes } = await databases.listAttributes(DB_ID, cid);
    if (attributes.every((a) => a.status === "available")) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

// ── Provision ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n▲ Provisioning Appwrite project ${PROJECT_ID}\n`);

  console.log("Database:");
  try {
    await databases.get(DB_ID);
    skip(`database ${DB_ID}`);
  } catch {
    await step(`database ${DB_ID}`, () => databases.create(DB_ID, "TSP Main"));
  }

  // ── lead_requests ──────────────────────────────────────────────────────
  console.log("\nCollection: lead_requests");
  await step("collection lead_requests", () =>
    databases.createCollection(DB_ID, "lead_requests", "Lead Requests", [
      Permission.create(Role.any()), // guests submit from the chatbot
      Permission.read(Role.team("admin")),
      Permission.update(Role.team("admin")),
      Permission.delete(Role.team("admin")),
    ])
  );
  await attr.string("lead_requests", "service", 128, true);
  await attr.string("lead_requests", "budget", 64, true);
  await attr.string("lead_requests", "timeline", 64, true);
  await attr.string("lead_requests", "description", 5000, true);
  await attr.string("lead_requests", "name", 128, true);
  await attr.email("lead_requests", "email", true);
  await attr.enum(
    "lead_requests",
    "status",
    ["new", "contacted", "qualified", "converted"],
    false,
    "new"
  );
  await waitForAttributes("lead_requests");
  await index("lead_requests", "idx_status", ["status"]);
  await index("lead_requests", "idx_email", ["email"]);

  // ── contacts ─────────────────────────────────────────────────────────────
  console.log("\nCollection: contacts");
  await step("collection contacts", () =>
    databases.createCollection(DB_ID, "contacts", "Contact Messages", [
      Permission.create(Role.any()),
      Permission.read(Role.team("admin")),
      Permission.delete(Role.team("admin")),
    ])
  );
  await attr.string("contacts", "name", 128, true);
  await attr.email("contacts", "email", true);
  await attr.string("contacts", "subject", 256, true);
  await attr.string("contacts", "message", 5000, true);

  // ── experts ──────────────────────────────────────────────────────────────
  console.log("\nCollection: experts");
  await step("collection experts", () =>
    databases.createCollection(DB_ID, "experts", "Experts", [
      Permission.read(Role.any()), // public directory
      Permission.create(Role.team("admin")),
      Permission.update(Role.team("admin")),
      Permission.delete(Role.team("admin")),
    ])
  );
  await attr.string("experts", "name", 128, true);
  await attr.string("experts", "role", 128, true);
  await attr.string("experts", "skills", 64, false, true); // string array
  await attr.string("experts", "avatarUrl", 512, false);
  await attr.bool("experts", "visibleOnHomepage", false, true);
  await waitForAttributes("experts");
  await index("experts", "idx_visible", ["visibleOnHomepage"]);

  // ── profiles ─────────────────────────────────────────────────────────────
  console.log("\nCollection: profiles");
  await step("collection profiles", () =>
    databases.createCollection(
      DB_ID,
      "profiles",
      "Profiles",
      [Permission.read(Role.team("admin")), Permission.create(Role.users())],
      true // document-level security: each user owns their profile
    )
  );
  await attr.string("profiles", "userId", 64, true);
  await attr.string("profiles", "name", 128, true);
  await attr.email("profiles", "email", true);
  await attr.enum("profiles", "role", ["client", "expert", "admin"], true);
  await attr.string("profiles", "company", 256, false);
  await attr.string("profiles", "phone", 32, false);
  await waitForAttributes("profiles");
  await index("profiles", "idx_userId", ["userId"], IndexType.Unique);

  // ── orders ───────────────────────────────────────────────────────────────
  console.log("\nCollection: orders");
  await step("collection orders", () =>
    databases.createCollection(
      DB_ID,
      "orders",
      "Orders",
      [
        Permission.create(Role.users()), // any signed-in client can create
        Permission.read(Role.team("admin")),
        Permission.update(Role.team("admin")),
        Permission.delete(Role.team("admin")),
      ],
      true // document-level security: clients see only their own orders
    )
  );
  await attr.string("orders", "orderNumber", 32, true);
  await attr.string("orders", "clientId", 64, true);
  await attr.string("orders", "clientName", 128, true);
  await attr.email("orders", "clientEmail", true);
  await attr.string("orders", "service", 128, true);
  await attr.string("orders", "title", 256, true);
  await attr.string("orders", "description", 5000, true);
  await attr.string("orders", "requirements", 5000, false);
  await attr.float("orders", "budget", false);
  await attr.enum("orders", "currency", ["USD", "PKR", "GBP", "EUR", "AUD", "CAD"], false);
  await attr.enum(
    "orders",
    "status",
    ["pending", "approved", "in_progress", "delivered", "completed", "rejected"],
    false,
    "pending"
  );
  await attr.bool("orders", "paid", false, false);
  await attr.string("orders", "requirementFileIds", 64, false, true);
  await attr.string("orders", "deliverableFileIds", 64, false, true);
  await waitForAttributes("orders");
  await index("orders", "idx_clientId", ["clientId"]);
  await index("orders", "idx_status", ["status"]);
  await index("orders", "idx_orderNumber", ["orderNumber"], IndexType.Unique);

  // ── Storage buckets ──────────────────────────────────────────────────────
  console.log("\nStorage buckets:");
  const buckets = [
    { id: "avatars", name: "Avatars", pub: false },
    { id: "experts", name: "Expert Photos", pub: true },
    { id: "attachments", name: "Attachments", pub: false },
    { id: "deliverables", name: "Deliverables", pub: false },
    { id: "invoices", name: "Invoices", pub: false },
    { id: "projects", name: "Projects", pub: false },
  ];
  for (const b of buckets) {
    try {
      await storage.createBucket(
        b.id,
        b.name,
        b.pub
          ? [Permission.read(Role.any()), Permission.create(Role.team("admin"))]
          : [Permission.create(Role.users())],
        false, // fileSecurity
        true, // enabled
        30 * 1024 * 1024 // 30 MB max
      );
      ok(`bucket ${b.id}`);
    } catch (e) {
      if (e?.code === 409) skip(`bucket ${b.id}`);
      else if (e?.type === "general_argument_invalid" || /maximum number of buckets/i.test(e?.message || ""))
        console.log(`  ! bucket ${b.id} skipped — plan bucket limit reached (create manually if needed)`);
      else throw e;
    }
  }

  // ── Seed experts ─────────────────────────────────────────────────────────
  console.log("\nSeeding experts:");
  const seed = [
    { name: "Ali Hassan", role: "Senior Full-Stack Engineer", skills: ["Next.js", "Node.js", "PostgreSQL"] },
    { name: "Zainab Malik", role: "Data Engineer", skills: ["Spark", "Airflow", "Python"] },
    { name: "Bilal Ahmed", role: "AI / ML Engineer", skills: ["TensorFlow", "PyTorch", "MLOps"] },
    { name: "Hira Sheikh", role: "Mobile Lead", skills: ["Flutter", "React Native", "Swift"] },
  ];
  const existing = await databases.listDocuments(DB_ID, "experts");
  if (existing.total > 0) {
    skip(`${existing.total} experts already seeded`);
  } else {
    for (const e of seed) {
      await step(`expert ${e.name}`, () =>
        databases.createDocument(DB_ID, "experts", ID.unique(), {
          ...e,
          visibleOnHomepage: true,
        })
      );
    }
  }

  console.log("\n✓ Done. Stage 1 backend is provisioned.\n");
  console.log("Next: enable Google OAuth in the console (Auth → Settings),");
  console.log("create an 'admin' team, and add the owner account to it.\n");
}

main().catch((e) => {
  console.error("\n✗ Provisioning failed:", e?.message || e);
  process.exit(1);
});
