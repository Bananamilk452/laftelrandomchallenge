"use client";

import { Dices, Loader2, LogOut } from "lucide-react";
import type { Profile } from "@/lib/types";
import { LaftelImage } from "./laftel-image";

type AppHeaderProps = {
  loggedIn: boolean;
  profile: Profile | null;
  isLoggingOut: boolean;
  onLogout: () => void;
};

export function AppHeader({
  loggedIn,
  profile,
  isLoggingOut,
  onLogout,
}: AppHeaderProps) {
  return (
    <header className="relative z-20 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-10 w-10 shrink-0 -rotate-3 items-center justify-center rounded-xl border-2 border-ink bg-butter shadow-[3px_3px_0_var(--ink)]">
          <Dices className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-base leading-none font-bold sm:text-xl">
            랜덤 라프텔 챌린지
          </p>
          <p className="mt-1 hidden text-[9px] font-bold tracking-[0.22em] text-ink/35 sm:block">
            RANDOM LAFTEL CHALLENGE
          </p>
        </div>
      </div>

      {loggedIn ? (
        <div className="flex shrink-0 items-center gap-2">
          {profile ? (
            <div className="flex max-w-[160px] items-center gap-2 rounded-full border-2 border-ink bg-paper py-1 pl-1 pr-3 shadow-[2px_2px_0_var(--ink)]">
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-ink bg-kraft">
                <LaftelImage
                  key={profile.id}
                  src={profile.image}
                  alt={`${profile.name} 프로필 이미지`}
                  sizes="32px"
                  fallback={
                    <span className="text-sm font-bold">
                      {profile.name.slice(0, 1)}
                    </span>
                  }
                />
              </div>
              <span className="truncate text-xs font-bold">{profile.name}</span>
            </div>
          ) : null}

          <button
            type="button"
            aria-label="로그아웃"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper text-ink/60 shadow-[2px_2px_0_var(--ink)] transition-colors hover:bg-blush hover:text-ink disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </button>
        </div>
      ) : (
        <span className="hidden rotate-2 rounded-full border-2 border-ink/25 bg-paper/60 px-3 py-1 text-[10px] font-bold text-ink/40 sm:block">
          라프텔 계정으로 시작
        </span>
      )}
    </header>
  );
}
