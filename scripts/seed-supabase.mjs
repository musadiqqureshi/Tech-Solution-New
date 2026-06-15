#!/usr/bin/env node
/**
 * Seed sample data into Supabase — 1 admin + 5 client users, plus the public
 * experts directory. Uses the service-role key (bypasses RLS). Idempotent.
 *
 * Usage:
 *   npm run seed:users     (reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local)
 *
 * All sample accounts share the password below so you can log in and test.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadDotEnv(path = ".env.local") {
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env))
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* ignore */
  }
}
loadDotEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SAMPLE_PASSWORD = process.env.SAMPLE_PASSWORD || "TspSample@2026";

if (!URL || !SERVICE_KEY) {
  console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  { name: "Site Admin", email: "admin@techsolutions.test", role: "admin" },
  { name: "Ayesha Khan", email: "ayesha.khan@techsolutions.test", role: "client", company: "Khan Retail" },
  { name: "Bilal Saeed", email: "bilal.saeed@techsolutions.test", role: "client", company: "Saeed Logistics" },
  { name: "Fatima Noor", email: "fatima.noor@techsolutions.test", role: "client", company: "NoorCare Clinics" },
  { name: "Omar Sheikh", email: "omar.sheikh@techsolutions.test", role: "client", company: "Sheikh Travels" },
  { name: "Zoya Malik", email: "zoya.malik@techsolutions.test", role: "client", company: "Malik Foods" },
];

const EXPERTS = [
  { name: "Usman Tariq", role: "Backend Engineer", skills: ["Python", "Django", "AWS"] },
  { name: "Sana Riaz", role: "Frontend Engineer", skills: ["React", "TypeScript", "Tailwind"] },
  { name: "Kamran Aziz", role: "DevOps Engineer", skills: ["Docker", "Kubernetes", "CI/CD"] },
  { name: "Nida Farooq", role: "Data Scientist", skills: ["Python", "Pandas", "ML"] },
  { name: "Hamza Iqbal", role: "Mobile Engineer", skills: ["Flutter", "Kotlin", "Swift"] },
];

/** Find an existing auth user by email (paginates the admin list). */
async function findUserByEmail(email) {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

async function ensureUser(u) {
  let existing = await findUserByEmail(u.email);
  let id;
  if (existing) {
    id = existing.id;
    console.log(`  • ${u.role} ${u.email} (exists)`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: SAMPLE_PASSWORD,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role },
    });
    if (error) throw error;
    id = data.user.id;
    console.log(`  ✓ ${u.role} ${u.email}`);
  }
  // Upsert the profile row (service role bypasses RLS).
  const { error: pErr } = await admin.from("profiles").upsert({
    id,
    name: u.name,
    email: u.email,
    role: u.role,
    company: u.company ?? null,
  });
  if (pErr) throw pErr;
}

async function ensureExpert(e) {
  const { data } = await admin.from("experts").select("id").eq("name", e.name).limit(1);
  if (data && data.length > 0) {
    console.log(`  • expert ${e.name} (exists)`);
    return;
  }
  const { error } = await admin.from("experts").insert({
    name: e.name,
    role: e.role,
    skills: e.skills,
    visible_on_homepage: true,
  });
  if (error) throw error;
  console.log(`  ✓ expert ${e.name}`);
}

async function main() {
  console.log(`\n▲ Seeding sample data into ${URL}`);
  console.log(`  Shared password: ${SAMPLE_PASSWORD}\n`);

  console.log("Users:");
  for (const u of USERS) await ensureUser(u);

  console.log("\nExperts directory:");
  for (const e of EXPERTS) await ensureExpert(e);

  console.log("\n✓ Done. Sample logins (password above):");
  for (const u of USERS) console.log(`  ${u.role.padEnd(6)} ${u.email}`);
  console.log("");
}

main().catch((e) => {
  console.error("\n✗ Seeding failed:", e?.message || e);
  process.exit(1);
});
