import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Wordmark } from "@/components/wordmark";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <Wordmark />
        <h1 className="mt-6 font-heading text-3xl font-medium text-foreground">Entrar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Continue de onde parou nas suas metas diárias.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
