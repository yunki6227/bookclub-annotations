import Link from "next/link";

import { signUpAction } from "@/features/auth/actions";
import { AuthForm } from "@/features/auth/components/AuthForm";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
        >
          Back to reader
        </Link>
        <h1 className="mt-5 text-3xl font-semibold text-slate-950">
          Create account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Use email and password for the Phase 5A dashboard.
        </p>
        <div className="mt-6">
          <AuthForm action={signUpAction} mode="sign-up" />
        </div>
      </div>
    </main>
  );
}
