import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { UndoToastHost } from "@/components/undo-toast";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("nome")
    .eq("id", data.user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Wordmark />
            <nav className="flex items-center gap-4">
              <Link
                href="/atividades"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Atividades
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {profile?.nome || data.user.email}
            </span>
            <form action={signOut}>
              <Button type="submit" variant="secondary" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
      <UndoToastHost />
    </div>
  );
}
