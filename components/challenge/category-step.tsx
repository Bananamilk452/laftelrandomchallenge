"use client";

import {
  ArrowLeft,
  Bookmark,
  Check,
  CheckCircle2,
  Dices,
  History,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "cn";
import type { Category, Profile } from "@/lib/types";
import { LaftelImage } from "./laftel-image";
import { StickerButton } from "./sticker-button";

const categories = [
  {
    id: "recent",
    title: "최근 본",
    description: "요즘 본 작품에서 뽑기",
    icon: History,
    tone: "bg-butter",
  },
  {
    id: "finished",
    title: "정주행",
    description: "끝까지 본 작품에서 뽑기",
    icon: CheckCircle2,
    tone: "bg-mint",
  },
  {
    id: "wish",
    title: "보고싶다",
    description: "찜해둔 작품에서 뽑기",
    icon: Bookmark,
    tone: "bg-blush",
  },
] as const;

type CategoryStepProps = {
  profile: Profile;
  category: Category | null;
  onSelectCategory: (category: Category) => void;
  onDraw: () => void;
  poolCount: number | null;
  isPoolLoading: boolean;
  poolError: string | null;
  onRetryPool: () => void;
  poolExhausted: boolean;
  onResetPool: () => void;
  onChangeProfile: () => void;
};

export function CategoryStep({
  profile,
  category,
  onSelectCategory,
  onDraw,
  poolCount,
  isPoolLoading,
  poolError,
  onRetryPool,
  poolExhausted,
  onResetPool,
  onChangeProfile,
}: CategoryStepProps) {
  const selectedCategory = categories.find((item) => item.id === category);
  const canDraw =
    Boolean(category) &&
    !isPoolLoading &&
    !poolError &&
    poolCount !== null &&
    poolCount > 0 &&
    !poolExhausted;

  return (
    <section className="w-full max-w-[520px] animate-pop-in">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <span className="inline-flex -rotate-2 items-center rounded-full border-2 border-ink bg-mint px-3 py-1 text-[10px] font-bold tracking-[0.18em] shadow-[2px_2px_0_var(--ink)]">
            STEP 2
          </span>
          <h2 className="mt-3 text-3xl leading-tight font-bold sm:text-4xl">
            어디서
            <br />
            뽑아볼까요?
          </h2>
        </div>

        <div className="mb-1 flex items-center gap-2 rounded-full border-2 border-ink bg-paper py-1 pl-1 pr-3 shadow-[2px_2px_0_var(--ink)]">
          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-ink bg-kraft">
            <LaftelImage
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
          <span className="max-w-24 truncate text-xs font-bold">
            {profile.name}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((item) => {
          const Icon = item.icon;
          const selected = category === item.id;

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectCategory(item.id)}
              className={cn(
                "group relative flex w-full items-center gap-4 rounded-2xl border-2 border-ink p-4 text-left shadow-[4px_4px_0_var(--ink)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-coral",
                item.tone,
                selected && "-rotate-1",
              )}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-paper/85 shadow-[2px_2px_0_var(--ink)]">
                <Icon className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xl font-bold">{item.title}</span>
                <span className="mt-0.5 block text-xs font-bold text-ink/55">
                  {item.description}
                </span>
              </span>

              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink transition-colors",
                  selected
                    ? "bg-paper text-ink shadow-[2px_2px_0_var(--ink)]"
                    : "border-ink/20 bg-paper/35 text-transparent",
                )}
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border-2 border-dashed border-ink/25 bg-paper/55 px-4 py-3 text-center">
        {!category ? (
          <p className="text-sm font-bold text-ink/45">
            카테고리를 하나 골라주세요.
          </p>
        ) : null}

        {category && isPoolLoading ? (
          <p className="flex items-center justify-center gap-2 text-sm font-bold text-ink/55">
            <Loader2 className="h-4 w-4 animate-spin" />
            목록을 불러오는 중...
          </p>
        ) : null}

        {category && poolError ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-bold text-ink/60">{poolError}</p>
            <button
              type="button"
              onClick={onRetryPool}
              className="inline-flex items-center gap-1.5 text-xs font-bold underline underline-offset-4"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              다시 불러오기
            </button>
          </div>
        ) : null}

        {category && !isPoolLoading && !poolError && poolCount === 0 ? (
          <div>
            <p className="text-sm font-bold text-ink/60">
              {selectedCategory?.title} 목록이 텅 비어 있어요.
            </p>
            <p className="mt-1 text-xs leading-5 text-ink/40">
              라프텔에서 작품을 담아두면 여기서 뽑을 수 있어요.
            </p>
          </div>
        ) : null}

        {category &&
        !isPoolLoading &&
        !poolError &&
        poolCount !== null &&
        poolCount > 0 &&
        !poolExhausted ? (
          <p className="text-sm font-bold text-ink/55">
            {poolCount}편 중에서 한 편을 뽑을 수 있어요.
          </p>
        ) : null}

        {category && poolExhausted ? (
          <div className="space-y-2">
            <p className="text-sm font-bold text-ink/60">
              이 카테고리는 다 뽑았어요!
            </p>
            <button
              type="button"
              onClick={onResetPool}
              className="text-xs font-bold underline underline-offset-4"
            >
              처음부터 다시 뽑기
            </button>
          </div>
        ) : null}
      </div>

      <StickerButton
        className="mt-4 w-full"
        disabled={!canDraw}
        onClick={onDraw}
      >
        {isPoolLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            목록 불러오는 중...
          </>
        ) : (
          <>
            <Dices className="h-5 w-5" />
            랜덤으로 뽑기
          </>
        )}
      </StickerButton>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onChangeProfile}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/40 underline-offset-4 hover:text-ink/70 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          프로필 다시 선택
        </button>
      </div>
    </section>
  );
}
