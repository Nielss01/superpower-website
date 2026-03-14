import { cookies } from "next/headers";

/** Returns true if the request carries a valid CRM auth cookie. */
export async function checkCrmAuth(): Promise<boolean> {
  const store = await cookies();
  const token  = process.env.CRM_AUTH_TOKEN;
  const cookie = store.get("sph_crm_auth")?.value;
  return !!(token && cookie === token);
}
