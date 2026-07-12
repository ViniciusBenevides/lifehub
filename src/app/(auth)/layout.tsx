import { Orbit } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Orbit className="size-5" aria-hidden />
        </span>
        <span className="text-2xl font-semibold tracking-tight">LifeHub</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
