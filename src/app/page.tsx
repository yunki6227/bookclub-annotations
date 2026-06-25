import { SamplePdfReader } from "@/features/reader/components/SamplePdfReader";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-8">
      <div className="mx-auto mb-5 flex w-full max-w-5xl justify-end">
        <Link
          href="/dashboard"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          Dashboard
        </Link>
      </div>
      <SamplePdfReader />
    </main>
  );
}
