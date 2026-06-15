import { databases, appwriteConfig, isAppwriteConfigured, ID } from "./appwrite";
import { Query } from "appwrite";
import type { LeadRequest, ContactMessage, Expert } from "./types";
import { FALLBACK_EXPERTS } from "./constants";

/** Persist a guided-chatbot lead. Falls back to a no-op success in dev. */
export async function submitLead(lead: LeadRequest): Promise<void> {
  if (!isAppwriteConfigured) {
    console.info("[dev] Lead captured (Appwrite not configured):", lead);
    return;
  }
  await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.leadsCollectionId,
    ID.unique(),
    { ...lead, status: "new" }
  );
}

/** Persist a contact-form message. */
export async function submitContact(msg: ContactMessage): Promise<void> {
  if (!isAppwriteConfigured) {
    console.info("[dev] Contact captured (Appwrite not configured):", msg);
    return;
  }
  await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.contactsCollectionId,
    ID.unique(),
    msg
  );
}

/** Load experts flagged as visible on the homepage; fall back to seed data. */
export async function getHomepageExperts(): Promise<Expert[]> {
  if (!isAppwriteConfigured) return FALLBACK_EXPERTS as Expert[];
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.expertsCollectionId,
      [Query.equal("visibleOnHomepage", true), Query.limit(12)]
    );
    if (res.documents.length === 0) return FALLBACK_EXPERTS as Expert[];
    return res.documents as unknown as Expert[];
  } catch (e) {
    console.warn("Failed to load experts, using fallback:", e);
    return FALLBACK_EXPERTS as Expert[];
  }
}
