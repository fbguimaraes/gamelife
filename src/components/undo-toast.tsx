"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const DURATION_MS = 15_000;

type ToastState = {
  message: string;
  onUndo: () => void;
  expiresAt: number;
} | null;

// Estado fora da árvore do React: a revalidação de rota (revalidatePath, nos
// Server Actions de completar/desfazer) pode recriar os componentes desta
// página, o que resetaria um `useState` local antes dos 15s previstos. Um
// módulo singleton sobrevive a essa remontagem.
let currentToast: ToastState = null;
let currentTimeout: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function showUndoToast(toast: { message: string; onUndo: () => void }) {
  if (currentTimeout) clearTimeout(currentTimeout);
  currentToast = { ...toast, expiresAt: Date.now() + DURATION_MS };
  notify();
  currentTimeout = setTimeout(() => {
    currentToast = null;
    notify();
  }, DURATION_MS);
}

function dismissToast() {
  if (currentTimeout) clearTimeout(currentTimeout);
  currentToast = null;
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentToast;
}

function ProgressBar({ expiresAt }: { expiresAt: number }) {
  const [full, setFull] = useState(true);
  const remaining = Math.max(0, expiresAt - Date.now());

  useEffect(() => {
    setFull(true);
    const raf = requestAnimationFrame(() => setFull(false));
    return () => cancelAnimationFrame(raf);
  }, [expiresAt]);

  return (
    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-border">
      <div
        className="h-full bg-primary transition-[width] ease-linear motion-reduce:transition-none"
        style={{
          width: full ? "100%" : "0%",
          transitionDuration: `${remaining}ms`,
        }}
      />
    </div>
  );
}

export function UndoToastHost() {
  const toast = useSyncExternalStore(subscribe, getSnapshot, () => null);

  if (!toast) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-6">
      <div className="relative flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-md border border-border bg-surface px-4 py-3">
        <p className="flex-1 text-sm text-foreground">{toast.message}</p>
        <button
          type="button"
          onClick={() => {
            toast.onUndo();
            dismissToast();
          }}
          className="text-sm font-medium text-foreground underline underline-offset-4"
        >
          Desfazer
        </button>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Fechar"
          className="text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
        <ProgressBar expiresAt={toast.expiresAt} />
      </div>
    </div>
  );
}
