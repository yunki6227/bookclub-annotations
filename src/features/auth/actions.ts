"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import type { AuthFormState } from "./types";

function getStringValue(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function validateEmailAndPassword(formData: FormData):
  | { email: string; password: string }
  | { message: string } {
  const email = getStringValue(formData, "email").toLowerCase();
  const password = getStringValue(formData, "password");

  if (!email || !password) {
    return { message: "Email and password are required." };
  }

  if (password.length < 6) {
    return { message: "Password must be at least 6 characters." };
  }

  return { email, password };
}

export async function signInAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = validateEmailAndPassword(formData);

  if ("message" in validated) {
    return { message: validated.message, status: "error" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validated);

  if (error) {
    return { message: error.message, status: "error" };
  }

  redirect("/dashboard");
}

export async function signUpAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = validateEmailAndPassword(formData);

  if ("message" in validated) {
    return { message: validated.message, status: "error" };
  }

  const displayName = getStringValue(formData, "displayName");
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    ...validated,
    options: {
      data: displayName ? { display_name: displayName } : undefined,
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { message: error.message, status: "error" };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    message:
      "Check your email to confirm your account, then sign in to continue.",
    status: "success",
  };
}

export async function signOutAction() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  redirect("/auth/sign-in");
}
