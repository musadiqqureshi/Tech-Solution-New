import { Client, Account, Databases, Storage, ID, OAuthProvider } from "appwrite";

export const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "tsp_main",
  leadsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_LEADS_COLLECTION_ID ?? "lead_requests",
  expertsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_EXPERTS_COLLECTION_ID ?? "experts",
  profilesCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID ?? "profiles",
  contactsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_CONTACTS_COLLECTION_ID ?? "contacts",
  expertsBucketId:
    process.env.NEXT_PUBLIC_APPWRITE_EXPERTS_BUCKET_ID ?? "experts",
  ownerEmail: process.env.NEXT_PUBLIC_OWNER_EMAIL ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

/** True only when a real Appwrite project id has been configured. */
export const isAppwriteConfigured = Boolean(appwriteConfig.projectId);

const client = new Client();

if (isAppwriteConfigured) {
  client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { client, ID, OAuthProvider };
