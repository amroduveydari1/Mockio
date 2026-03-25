import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-xl shadow p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h1>
        <p className="mb-4 text-zinc-700 dark:text-zinc-300">
          There was a problem signing you in with Google. Please try again, or contact support if the issue persists.
        </p>
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
