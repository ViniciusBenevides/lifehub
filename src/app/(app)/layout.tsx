import { BottomTabs } from "@/components/features/shell/bottom-tabs";
import { AppSidebar } from "@/components/features/shell/sidebar";
import { requireUser } from "@/server/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh w-full">
      <AppSidebar user={{ name: user.name, email: user.email, image: user.image ?? null }} />
      <div className="min-w-0 flex-1 pb-24 md:pb-0">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <BottomTabs />
    </div>
  );
}
