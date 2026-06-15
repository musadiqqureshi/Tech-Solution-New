#!/usr/bin/env node
/**
 * Seed sample users for Tech Solutions Pakistan — 5 experts + 5 clients.
 *
 * Creates Appwrite Auth accounts, sets each user's role preference, creates a
 * matching `profiles` document, and (for experts) an `experts` directory entry.
 * Idempotent: existing accounts/profiles are detected and skipped.
 *
 * Usage:
 *   APPWRITE_PROJECT_ID=xxx APPWRITE_API_KEY=xxx npm run seed:users
 *
 * All sample accounts share the password below so you can log in and test.
 */

import {
  Client,
  Users,
  Databases,
  Query,
  ID,
  Permission,
  Role,
} from "node-appwrite";

const ENDPOINT =
  process.env.APPWRITE_ENDPOINT ||
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
  "https://cloud.appwrite.io/v1";
const PROJECT_ID =
  process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tsp_main";
const SAMPLE_PASSWORD = process.env.SAMPLE_PASSWORD || "TspSample@2026";

if (!PROJECT_ID || !API_KEY) {
  console.error("✗ Missing APPWRITE_PROJECT_ID and/or APPWRITE_API_KEY.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);
const users = new Users(client);
const databases = new Databases(client);

const EXPERTS = [
  { name: "Usman Tariq", role: "Backend Engineer", skills: ["Python", "Django", "AWS"] },
  { name: "Sana Riaz", role: "Frontend Engineer", skills: ["React", "TypeScript", "Tailwind"] },
  { name: "Kamran Aziz", role: "DevOps Engineer", skills: ["Docker", "Kubernetes", "CI/CD"] },
  { name: "Nida Farooq", role: "Data Scientist", skills: ["Python", "Pandas", "ML"] },
  { name: "Hamza Iqbal", role: "Mobile Engineer", skills: ["Flutter", "Kotlin", "Swift"] },
];

const CLIENTS = [
  { name: "Ayesha Khan", company: "Khan Retail" },
  { name: "Bilal Saeed", company: "Saeed Logistics" },
  { name: "Fatima Noor", company: "NoorCare Clinics" },
  { name: "Omar Sheikh", company: "Sheikh Travels" },
  { name: "Zoya Malik", company: "Malik Foods" },
];

const slug = (name) => name.toLowerCase().replace(/[^a-z]+/g, ".");
const emailFor = (name, kind) => `${slug(name)}.${kind}@techsolutions.test`;

async function ensureUser(name, email, role) {
  // Find existing by email, else create.
  const found = await users.list([Query.equal("email", email)]);
  let userId;
  if (found.total > 0) {
    userId = found.users[0].$id;
    console.log(`  • user ${email} (exists)`);
  } else {
    const created = await users.create(ID.unique(), email, undefined, SAMPLE_PASSWORD, name);
    userId = created.$id;
    console.log(`  ✓ user ${email}`);
  }
  try {
    await users.updatePrefs(userId, { role });
  } catch {
    /* non-fatal */
  }
  return userId;
}

async function ensureProfile(userId, name, email, role, company) {
  const existing = await databases.listDocuments(DB_ID, "profiles", [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);
  if (existing.total > 0) {
    console.log(`    • profile (exists)`);
    return;
  }
  await databases.createDocument(
    DB_ID,
    "profiles",
    ID.unique(),
    { userId, name, email, role, ...(company ? { company } : {}) },
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.read(Role.team("admin")),
      Permission.update(Role.team("admin")),
    ]
  );
  console.log(`    ✓ profile`);
}

async function ensureExpertDoc(name, role, skills) {
  const existing = await databases.listDocuments(DB_ID, "experts", [
    Query.equal("name", name),
    Query.limit(1),
  ]);
  if (existing.total > 0) {
    console.log(`    • expert directory entry (exists)`);
    return;
  }
  await databases.createDocument(DB_ID, "experts", ID.unique(), {
    name,
    role,
    skills,
    visibleOnHomepage: true,
  });
  console.log(`    ✓ expert directory entry`);
}

async function main() {
  console.log(`\n▲ Seeding sample users into ${PROJECT_ID}`);
  console.log(`  Shared password: ${SAMPLE_PASSWORD}\n`);

  console.log("Experts:");
  for (const e of EXPERTS) {
    const email = emailFor(e.name, "expert");
    const userId = await ensureUser(e.name, email, "expert");
    await ensureProfile(userId, e.name, email, "expert");
    await ensureExpertDoc(e.name, e.role, e.skills);
  }

  console.log("\nClients:");
  for (const c of CLIENTS) {
    const email = emailFor(c.name, "client");
    const userId = await ensureUser(c.name, email, "client");
    await ensureProfile(userId, c.name, email, "client", c.company);
  }

  console.log("\n✓ Done. Sample accounts (password above):");
  for (const e of EXPERTS) console.log(`  expert  ${emailFor(e.name, "expert")}`);
  for (const c of CLIENTS) console.log(`  client  ${emailFor(c.name, "client")}`);
  console.log("");
}

main().catch((e) => {
  console.error("\n✗ Seeding failed:", e?.message || e);
  process.exit(1);
});
