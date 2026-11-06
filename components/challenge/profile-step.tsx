"use client";

import { ChevronRight, Loader2, RefreshCw, UserRound } from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile } from "@/lib/types";
import { LaftelImage } from "./laftel-image";
import { StickerButton } from "./sticker-button";

type ProfileStepProps = {
  profiles: Profile[];
  isFetching: boolean;
  isSelecting: boolean;
  selectingProfileId: number | null;
  errorMessage: string | null;
  onSelect: (profile: Profile) => void;
  onRetry: () => void;
};

export function ProfileStep({
  profiles,
  isFetching,
  isSelecting,
  selectingProfileId,
  errorMessage,
  onSelect,
  onRetry,
}: ProfileStepProps) {
  return (
    <section className="w-full max-w-[560px] animate-pop-in">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <span className="inline-flex -rotate-2 items-center rounded-full border-2 border-ink bg-butter px-3 py-1 text-[10px] font-bold tracking-[0.18em] shadow-[2px_2px_0_var(--ink)]">
            STEP 1
          </span>
          <h2 className="mt-3 text-3xl leading-tight font-bold sm:text-4xl">
            누구의 취향으로
            <br />
            뽑아볼까요?
          </h2>
        </div>
        <UserRound className="mb-1 hidden h-10 w-10 text-ink/20 sm:block" />
      </div>

      {errorMessage ? (
        <div className="paper-card mb-4 p-5 text-center">
          <p className="text-sm font-bold text-ink/70">{errorMessage}</p>
          <StickerButton
            tone="paper"
            className="mt-3"
            onClick={onRetry}
            disabled={isFetching}
          >
            <RefreshCw className="h-4 w-4" />
            다시 불러오기
          </StickerButton>
        </div>
      ) : null}

      {isFetching && profiles.length === 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="paper-card flex flex-col items-center gap-3 p-5"
            >
              <Skeleton className="h-20 w-20 rounded-full border-2 border-ink/15 bg-kraft" />
              <Skeleton className="h-5 w-20 bg-kraft" />
            </div>
          ))}
        </div>
      ) : null}

      {!errorMessage && !isFetching && profiles.length === 0 ? (
        <div className="paper-card p-6 text-center">
          <p className="text-lg font-bold">프로필을 찾지 못했어요.</p>
          <p className="mt-1 text-sm leading-6 text-ink/55">
            라프텔에 프로필이 있는지 확인한 뒤 다시 시도해주세요.
          </p>
          <StickerButton tone="paper" className="mt-4" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            다시 불러오기
          </StickerButton>
        </div>
      ) : null}

      {profiles.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {profiles.map((profile, index) => (
            <button
              key={profile.id}
              type="button"
              aria-label={`${profile.name} 프로필 선택`}
              aria-busy={isSelecting && selectingProfileId === profile.id}
              disabled={isSelecting}
              onClick={() => onSelect(profile)}
              className="paper-card group relative flex flex-col items-center gap-3 overflow-visible p-5 pt-7 text-center transition-transform duration-200 hover:-translate-y-1 hover:-rotate-1 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-coral active:translate-y-0 disabled:pointer-events-none disabled:opacity-70"
            >
              <div
                className="washi-tape -top-2.5 left-4 -rotate-3 opacity-80"
                style={{ width: "3.75rem" }}
              />

              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-ink bg-kraft shadow-[2px_2px_0_var(--ink)]">
                <LaftelImage
                  src={profile.image}
                  alt={`${profile.name} 프로필 이미지`}
                  sizes="80px"
                  eager
                  fallback={<span className="text-2xl font-bold">{profile.name.slice(0, 1)}</span>}
                />
              </div>

              <div className="min-w-0">
                <p className="max-w-[9rem] truncate text-lg font-bold">
                  {profile.name}
                </p>
                <p className="mt-0.5 text-[10px] font-bold tracking-[0.12em] text-ink/35">
                  PROFILE {String(index + 1).padStart(2, "0")}
                </p>
              </div>

              {profile.isMain ? (
                <Badge className="border-2 border-ink bg-mint text-[10px] font-bold text-ink">
                  대표
                </Badge>
              ) : null}

              <span
                className={cn(
                  "absolute right-3 bottom-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-butter shadow-[1px_1px_0_var(--ink)] transition-opacity",
                  isSelecting && selectingProfileId === profile.id
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100",
                )}
              >
                {isSelecting && selectingProfileId === profile.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <p className="mt-5 text-center text-[11px] leading-5 font-bold text-ink/40">
        프로필 선택은 저장되지 않아요. 새로고침하면 다시 골라요.
      </p>
    </section>
  );
}
