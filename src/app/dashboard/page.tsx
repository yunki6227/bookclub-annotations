import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/features/auth/components/SignOutButton";
import { CreateClubForm } from "@/features/clubs/components/CreateClubForm";
import { getDashboardClubs } from "@/features/clubs/services/clubQueries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/auth/sign-in");
  }

  const userId = claimsData.claims.sub;
  const userEmail =
    typeof claimsData.claims.email === "string"
      ? claimsData.claims.email
      : "Authenticated reader";

  const [{ data: profile, error: profileError }, clubsResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", userId)
        .maybeSingle(),
      getDashboardClubs(supabase),
    ]);

  const displayName = profile?.display_name || userEmail;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            {displayName}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{userEmail}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Reader
          </Link>
          <SignOutButton />
        </div>
      </div>

      {profileError ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Signed in, but the profile row could not be loaded:{" "}
          {profileError.message}
        </p>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Your clubs</h2>
          {clubsResult.errorMessage ? (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              Could not load clubs: {clubsResult.errorMessage}
            </p>
          ) : clubsResult.clubs.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No clubs yet. Create a private reading club to start.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200">
              {clubsResult.clubs.map((club) => (
                <li
                  key={club.id}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-950">{club.name}</p>
                    <p className="text-sm text-slate-500">
                      Joined {new Date(club.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="self-start rounded-md bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-700 sm:self-center">
                    {club.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">
            Create club
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Clubs are private in this phase. Invites and member search come
            later.
          </p>
          <div className="mt-5">
            <CreateClubForm />
          </div>
        </aside>
      </section>
    </main>
  );
}
