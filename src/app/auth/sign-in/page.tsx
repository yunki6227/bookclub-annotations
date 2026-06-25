import Link from "next/link";

import { signInAction } from "@/features/auth/actions";
import { AuthForm } from "@/features/auth/components/AuthForm";

type SignInPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
        >
          Back to reader
        </Link>
        <h1 className="mt-5 text-3xl font-semibold text-slate-950">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Access your private dashboard and reading clubs.
        </p>
        {params?.message ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.message}
          </p>
        ) : null}
        <div className="mt-6">
          <AuthForm action={signInAction} mode="sign-in" />
        </div>
      </div>
    </main>
  );
}
