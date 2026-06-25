export default function DashboardLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10 sm:px-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Loading your clubs...
        </h1>
      </div>
      <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Checking your authenticated session.
      </div>
    </main>
  );
}
