"use client";

import { useActionState } from "react";

import { createClubAction } from "@/features/clubs/actions";
import { initialCreateClubState } from "@/features/clubs/actionState";

export function CreateClubForm() {
  const [state, formAction, isPending] = useActionState(
    createClubAction,
    initialCreateClubState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Club name
        <input
          name="name"
          type="text"
          required
          maxLength={120}
          className="rounded-md border border-slate-300 px-3 py-2 text-base font-normal text-slate-950 outline-none transition focus:border-slate-700"
          placeholder="Sunday Readers"
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
        className="self-start rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? "Creating..." : "Create club"}
      </button>
    </form>
  );
}
