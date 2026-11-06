"use client";

import {
  AlertCircle,
  Dices,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StickerButton } from "./sticker-button";

export function BootingCard() {
  return (
    <section className="w-full max-w-[360px] animate-pop-in">
      <div className="paper-card relative p-7 text-center">
        <div className="washi-tape -top-2.5 left-1/2 -translate-x-1/2 -rotate-2" />

        <span className="animate-bounce-soft mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-ink bg-butter shadow-[4px_4px_0_var(--ink)]">
          <Dices className="h-8 w-8" />
        </span>

        <h2 className="mt-5 text-2xl font-bold">오늘의 애니를 준비 중...</h2>
        <p className="mt-1 text-xs leading-5 font-bold text-ink/45">
          라프텔에서 목록을 가져오고 있어요.
        </p>

        <div className="mt-5 space-y-2">
          <Skeleton className="h-9 rounded-xl bg-kraft" />
          <Skeleton className="h-9 w-4/5 rounded-xl bg-kraft" />
          <Skeleton className="h-9 w-2/3 rounded-xl bg-kraft" />
        </div>
      </div>
    </section>
  );
}

export function DrawingCard({ isPoolLoading }: { isPoolLoading: boolean }) {
  return (
    <section className="w-full max-w-[380px] animate-pop-in text-center">
      <div className="paper-card relative overflow-hidden px-6 py-8">
        <Sparkles className="absolute left-6 top-6 h-5 w-5 text-coral" />
        <Sparkles className="absolute right-7 bottom-8 h-4 w-4 text-mint" />

        <div className="relative mx-auto h-44 w-64">
          <div className="animate-shuffle-left absolute left-4 top-10 flex h-32 w-24 items-center justify-center rounded-xl border-2 border-ink bg-mint shadow-[3px_3px_0_var(--ink)]">
            <span className="text-3xl font-bold text-ink/30">?</span>
          </div>
          <div className="animate-shuffle-right absolute right-4 top-10 flex h-32 w-24 items-center justify-center rounded-xl border-2 border-ink bg-blush shadow-[3px_3px_0_var(--ink)]">
            <span className="text-3xl font-bold text-ink/30">?</span>
          </div>
          <div className="absolute left-1/2 top-4 flex h-36 w-28 -translate-x-1/2 -rotate-2 items-center justify-center rounded-xl border-2 border-ink bg-paper shadow-[4px_4px_0_var(--ink)]">
            <Dices className="animate-wiggle h-10 w-10" />
          </div>
        </div>

        <h2 className="mt-3 text-3xl font-bold">두구두구...</h2>
        <p className="mt-1 text-sm font-bold text-ink/45">
          오늘의 애니를 고르는 중
        </p>

        {isPoolLoading ? (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-bold text-ink/40">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            목록을 불러오는 중이에요
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function ErrorCard({
  message,
  onRetry,
  onLogin,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  onLogin: () => void;
  isRetrying: boolean;
}) {
  return (
    <section className="w-full max-w-[380px] animate-pop-in">
      <div className="paper-card relative p-7 text-center">
        <div className="washi-tape -top-2.5 left-8 -rotate-2 bg-blush/80" />

        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-blush shadow-[3px_3px_0_var(--ink)]">
          <AlertCircle className="h-7 w-7" />
        </span>

        <h2 className="mt-4 text-2xl font-bold">앗, 문제가 생겼어요.</h2>
        <p className="mt-2 text-sm leading-6 font-bold text-ink/55">
          {message}
        </p>

        <StickerButton
          tone="paper"
          className="mt-5 w-full"
          onClick={onRetry}
          disabled={isRetrying}
        >
          <RefreshCw className={isRetrying ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          다시 시도
        </StickerButton>

        <button
          type="button"
          onClick={onLogin}
          className="mt-4 text-xs font-bold text-ink/40 underline underline-offset-4 hover:text-ink/70"
        >
          로그인 화면으로 돌아가기
        </button>
      </div>
    </section>
  );
}
