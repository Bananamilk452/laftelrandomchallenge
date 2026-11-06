"use client";

import { forwardRef, useState } from "react";
import { Dices, Sparkles, Star as StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { AnimeItem, Category } from "@/lib/types";
import { SERVICE_HOST } from "@/lib/site";
import { LaftelImage } from "./laftel-image";
import { StarRating } from "./star-rating";

const categoryLabels: Record<Category, string> = {
  recent: "최근 본",
  finished: "정주행",
  wish: "보고싶다",
};

const hashtags = ["#랜덤라프텔챌린지", "#라프텔", "#애니추천"];

function formatDate(date: Date) {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

type ShareCardProps = {
  item: AnimeItem;
  category: Category;
  rating: number;
  review: string;
  onRatingChange: (value: number) => void;
  onReviewChange: (value: string) => void;
  onEditingChange?: (editing: boolean) => void;
};

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard(
    {
      item,
      category,
      rating,
      review,
      onRatingChange,
      onReviewChange,
      onEditingChange,
    },
    ref,
  ) {
    const [dateLabel] = useState(() => formatDate(new Date()));

    return (
      <div
        ref={ref}
        className="w-full max-w-[480px] p-2 sm:p-3"
        onFocusCapture={() => onEditingChange?.(true)}
        onBlurCapture={() => onEditingChange?.(false)}
      >
        <article className="dot-paper relative overflow-hidden rounded-[2rem] border-2 border-ink p-4 shadow-[8px_8px_0_var(--ink)] sm:p-6">
          <Sparkles className="absolute top-5 right-5 h-5 w-5 rotate-12 text-coral" />
          <StarIcon className="absolute bottom-8 left-5 h-4 w-4 -rotate-12 fill-butter text-ink/40" />

          <div className="relative">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 -rotate-6 items-center justify-center rounded-xl border-2 border-ink bg-butter shadow-[2px_2px_0_var(--ink)]">
                  <Dices className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[9px] font-bold tracking-[0.2em] text-ink/45">
                    RANDOM LAFTEL CHALLENGE
                  </p>
                  <p className="text-sm leading-tight font-bold">
                    오늘의 애니 기록
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-full border-2 border-ink bg-paper px-2.5 py-1 text-[10px] font-bold tabular-nums">
                {dateLabel}
              </span>
            </div>

            <div className="relative rounded-[1.45rem] border-2 border-ink bg-paper p-4 sm:p-5">
              <div className="washi-tape -top-2.5 left-7 -rotate-2" />
              <div className="washi-tape -top-2.5 right-7 rotate-2 bg-blush/80" />

              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border-2 border-ink bg-kraft">
                <LaftelImage
                  src={item.image}
                  alt={`${item.title} 썸네일`}
                  sizes="(max-width: 640px) 80vw, 400px"
                  eager
                  fallback={
                    <div className="flex flex-col items-center gap-2 text-ink/50">
                      <Dices className="h-9 w-9" />
                      <span className="text-[10px] font-bold">
                        NO IMAGE
                      </span>
                    </div>
                  }
                />
                <span className="absolute bottom-2 left-2 inline-flex items-center rounded-full border-2 border-ink bg-paper px-2 py-0.5 text-[10px] font-bold shadow-[1px_1px_0_var(--ink)]">
                  {categoryLabels[category]}
                </span>
              </div>

              <h2 className="mt-4 text-2xl leading-snug font-bold break-words">
                {item.title}
              </h2>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.genres.slice(0, 3).map((genre) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className="border-ink/30 bg-cream text-[10px] font-bold text-ink/65"
                  >
                    #{genre}
                  </Badge>
                ))}
                {item.averageRating !== null ? (
                  <Badge className="border-ink/25 bg-butter text-[10px] font-bold text-ink">
                    <StarIcon className="h-3 w-3 fill-ink" />
                    라프텔 {item.averageRating.toFixed(1)}
                  </Badge>
                ) : null}
              </div>

              <div className="my-4 border-t-2 border-dashed border-ink/20" />

              <div>
                <span className="text-sm font-bold">나의 별점</span>
                <StarRating
                  value={rating}
                  onChange={onRatingChange}
                  size="lg"
                  className="mt-2"
                  label="나의 별점"
                />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold">한줄 감상평</span>
                  <span className="text-[10px] font-bold tabular-nums text-ink/35">
                    {review.length} / 100
                  </span>
                </div>
                <Textarea
                  id="challenge-review"
                  name="review"
                  value={review}
                  onChange={(event) =>
                    onReviewChange(event.target.value.slice(0, 100))
                  }
                  rows={3}
                  maxLength={100}
                  placeholder="이 작품, 어땠나요? 한 줄로 남겨보세요."
                  aria-label="한줄 감상평"
                  className="memo-lines mt-2 min-h-[112px] resize-none rounded-xl border-0 border-b-2 border-dashed border-ink/25 bg-transparent px-1 py-2 text-lg leading-8 shadow-none placeholder:text-ink/30 focus-visible:border-ink focus-visible:ring-0"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {hashtags.map((hashtag) => (
                  <span
                    key={hashtag}
                    className="rounded-full bg-cream px-2 py-1 text-[10px] font-bold text-ink/55"
                  >
                    {hashtag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t-2 border-dashed border-ink/20 pt-3 text-[9px] font-bold tracking-[0.14em] text-ink/35">
                <span>PLAY WITH YOUR TASTE</span>
                <span>LAFTEL RANDOM CHALLENGE</span>
              </div>

              <p className="mt-2 text-center text-[10px] font-bold tracking-[0.04em] text-ink/45">
                {SERVICE_HOST}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between px-1 text-[9px] font-bold tracking-[0.14em] text-ink/35">
              <span>TODAY&apos;S PICK</span>
              <span>{dateLabel}</span>
            </div>
          </div>
        </article>
      </div>
    );
  },
);
