"use client";

import { useState, type FormEvent } from "react";
import {
  Dices,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StickerButton } from "./sticker-button";

type LoginStepProps = {
  onSubmit: (email: string, password: string) => void;
  onClearError: () => void;
  isPending: boolean;
  errorMessage: string | null;
  notice: string | null;
};

export function LoginStep({
  onSubmit,
  onClearError,
  isPending,
  errorMessage,
  notice,
}: LoginStepProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setLocalError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLocalError(null);
    onSubmit(email.trim(), password);
  };

  const message = localError ?? errorMessage;

  return (
    <section className="w-full max-w-[420px] animate-pop-in">
      <div className="paper-panel relative px-6 py-7 sm:px-8 sm:py-9">
        <div className="washi-tape -top-3 left-8 -rotate-2" />
        <div className="washi-tape -top-3 right-8 rotate-3 bg-blush/85" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.28em] text-ink/45">
              WELCOME TO
            </p>
            <h1 className="mt-1 text-3xl leading-[1.15] font-bold sm:text-4xl">
              랜덤 라프텔
              <br />
              챌린지
            </h1>
          </div>

          <div className="relative">
            <span className="animate-wiggle flex h-14 w-14 -rotate-6 items-center justify-center rounded-2xl border-2 border-ink bg-butter shadow-[4px_4px_0_var(--ink)]">
              <Dices className="h-7 w-7" />
            </span>
            <Sparkles className="absolute -right-2 -top-2 h-5 w-5 text-coral" />
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-ink/60">
          오늘 볼 애니, 운명에게 맡겨볼까요?
          <br />
          라프텔 계정으로 로그인하고 시작해요.
        </p>

        {notice ? (
          <p className="mt-4 rounded-xl border-2 border-ink/20 bg-butter/55 px-3 py-2 text-xs leading-5 font-bold text-ink/70">
            {notice}
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="laftel-email" className="text-sm font-bold">
              라프텔 이메일
            </Label>
            <Input
              id="laftel-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              placeholder="hello@example.com"
              value={email}
              disabled={isPending}
              onChange={(event) => {
                setEmail(event.target.value);
                setLocalError(null);
                onClearError();
              }}
              className="h-12 rounded-xl border-2 border-ink bg-paper px-4 text-base shadow-[2px_2px_0_var(--ink)] placeholder:text-ink/30 focus-visible:border-ink focus-visible:ring-3 focus-visible:ring-coral/45 disabled:shadow-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="laftel-password" className="text-sm font-bold">
              비밀번호
            </Label>
            <div className="relative">
              <Input
                id="laftel-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                disabled={isPending}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setLocalError(null);
                  onClearError();
                }}
                className="h-12 rounded-xl border-2 border-ink bg-paper px-4 pr-12 text-base shadow-[2px_2px_0_var(--ink)] placeholder:text-ink/30 focus-visible:border-ink focus-visible:ring-3 focus-visible:ring-coral/45 disabled:shadow-none"
              />
              <button
                type="button"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink/55 transition-colors hover:bg-kraft hover:text-ink"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {message ? (
            <p
              role="alert"
              className="rounded-xl border-2 border-ink/20 bg-blush/55 px-3 py-2 text-xs leading-5 font-bold text-ink/75"
            >
              {message}
            </p>
          ) : null}

          <StickerButton
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                로그인 중...
              </>
            ) : (
              <>
                <LockKeyhole className="h-4 w-4" />
                라프텔로 로그인
              </>
            )}
          </StickerButton>
        </form>

        <div className="mt-5 border-t-2 border-dashed border-ink/20 pt-4 text-[11px] leading-5 font-bold text-ink/40">
          계정 정보는 라프텔 로그인에만 사용되고 저장되지 않아요.
          <br />
          로그인 상태만 30일간 쿠키로 유지됩니다.
        </div>
      </div>
    </section>
  );
}
