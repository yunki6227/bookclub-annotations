import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type ClubMembershipRow = {
  clubs: {
    created_at: string;
    id: string;
    name: string;
  } | null;
  joined_at: string;
  role: "admin" | "member" | "owner";
};

export type DashboardClub = {
  createdAt: string;
  id: string;
  joinedAt: string;
  name: string;
  role: "admin" | "member" | "owner";
};

export async function getDashboardClubs(
  supabase: SupabaseClient<Database>,
): Promise<{ clubs: DashboardClub[]; errorMessage: string | null }> {
  const { data, error } = await supabase
    .from("club_members")
    .select("role, joined_at, clubs(id, name, created_at)")
    .order("joined_at", { ascending: false })
    .returns<ClubMembershipRow[]>();

  if (error) {
    return { clubs: [], errorMessage: error.message };
  }

  return {
    clubs: (data ?? []).flatMap((membership) =>
      membership.clubs
        ? [
            {
              createdAt: membership.clubs.created_at,
              id: membership.clubs.id,
              joinedAt: membership.joined_at,
              name: membership.clubs.name,
              role: membership.role,
            },
          ]
        : [],
    ),
    errorMessage: null,
  };
}
