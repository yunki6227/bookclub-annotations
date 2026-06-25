import { createBrowserClient } from "@supabase/ssr";

import { getPublicSupabaseEnv } from "@/lib/env";

import type { Database } from "./database.types";

export function createClient() {
  const { supabasePublishableKey, supabaseUrl } = getPublicSupabaseEnv();

  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
}
