"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import type { CreateClubState } from "./actionState";

export async function createClubAction(
  _previousState: CreateClubState,
  formData: FormData,
): Promise<CreateClubState> {
  const nameValue = formData.get("name");
  const name = typeof nameValue === "string" ? nameValue.trim() : "";

  if (!name) {
    return { message: "Club name is required.", status: "error" };
  }

  if (name.length > 120) {
    return {
      message: "Club name must be 120 characters or fewer.",
      status: "error",
    };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return { message: "Sign in before creating a club.", status: "error" };
  }

  const { error } = await supabase.rpc("create_club_with_owner", {
    club_name: name,
  });

  if (error) {
    return { message: error.message, status: "error" };
  }

  revalidatePath("/dashboard");

  return { message: "Club created.", status: "success" };
}
