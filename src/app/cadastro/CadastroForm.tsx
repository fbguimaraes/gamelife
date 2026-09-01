"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type SignupFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SignupFormState = { error: null, info: null };

export function CadastroForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  if (state.info) {
    return (
      <p role="status" className="text-sm text-foreground">
        {state.info}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" type="text" required autoComplete="name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Criando conta..." : "Criar conta"}
      </Button>
      <p className="text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </form>
  );
}
