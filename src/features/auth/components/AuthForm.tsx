"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthFormState } from "../types";
import { initialAuthFormState } from "../types";

type AuthFormProps = {
  action: (
    previousState: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
  mode: "sign-in" | "sign-up";
};

export function AuthForm({ action, mode }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialAuthFormState,
  );
  const isSignUp = mode === "sign-up";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {isSignUp ? (
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Display name
          <input
            name="displayName"
            type="text"
            autoComplete="name"
            className="rounded-md border border-slate-300 px-3 py-2 text-base font-normal text-slate-950 outline-none transition focus:border-slate-700"
            placeholder="Ada Lovelace"
          />
        </label>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-base font-normal text-slate-950 outline-none transition focus:border-slate-700"
          placeholder="reader@example.com"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Password
        <input
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          minLength={6}
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-base font-normal text-slate-950 outline-none transition focus:border-slate-700"
        />
      </label>

      {state.message ? (
        <p
          aria-live="polite"
          className={
            state.status === "error"
              ? "rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
              : "rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          }
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? "Working..." : isSignUp ? "Create account" : "Sign in"}
      </button>

      <p className="text-sm text-slate-600">
        {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
        <Link
          href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"}
          className="font-medium text-slate-950 underline-offset-4 hover:underline"
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </form>
  );
}
