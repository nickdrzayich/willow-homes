import { requireUser } from "@/lib/auth";
import { NavBar } from "@/components/layout/nav-bar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireUser();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <NavBar displayName={profile?.display_name ?? null} email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
