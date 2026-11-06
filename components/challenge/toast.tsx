"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "cn";

export type ToastTone = "success" | "error" | "info";

export type ToastState = {
  id: number;
  message: string;
  tone: ToastTone;
};

const toneStyles = {
  success: "bg-mint",
  error: "bg-blush",
  info: "bg-butter",
} as const;

const toneIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

export function Toast({
  toast,
  onClose,
}: {
  toast: ToastState | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(onClose, 3_200);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const Icon = toneIcons[toast.tone];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-pop-in rounded-2xl border-2 border-ink px-4 py-3 text-sm font-bold text-ink shadow-[4px_4px_0_var(--ink)]",
        toneStyles[toast.tone],
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 shrink-0" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
