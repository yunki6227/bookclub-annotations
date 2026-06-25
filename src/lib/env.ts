type PublicSupabaseEnv = {
  supabasePublishableKey: string;
  supabaseUrl: string;
};

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to .env.local before using Supabase-backed routes.`,
    );
  }

  return value;
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  return {
    supabasePublishableKey: readRequiredEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ),
    supabaseUrl: readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  };
}
