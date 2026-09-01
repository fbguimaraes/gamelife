"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignupFormState = {
  error: string | null;
  info: string | null;
};

export async function signup(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!nome) {
    return { error: "Informe seu nome.", info: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome } },
  });

  if (error) {
    return { error: error.message, info: null };
  }

  if (!data.session) {
    return {
      error: null,
      info: "Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de entrar.",
    };
  }

  redirect("/");
}
