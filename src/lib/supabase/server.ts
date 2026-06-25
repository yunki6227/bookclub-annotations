import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getPublicSupabaseEnv } from "@/lib/env";

import type { Database } from "./database.types";

export async function createClient() {
  const cookieStore = await cookies();
  const { supabasePublishableKey, supabaseUrl } = getPublicSupabaseEnv();

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; the proxy refreshes sessions.
        }
      },
    },
  });
}
