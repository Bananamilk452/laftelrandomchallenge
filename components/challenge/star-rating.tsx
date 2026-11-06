"use client";

import { useId, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "cn";

const starSizes = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-9 w-9",
} as const;

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: keyof typeof starSizes;
  className?: string;
  label?: string;
};

export function StarRating({
  value,
  onChange,
  size = "md",
  className,
  label = "별점",
}: StarRatingProps) {
  const groupName = useId();
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const interactive = typeof onChange === "function";
  const displayValue = hoverValue ?? value;
  const starSize = starSizes[size];

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5", className)}>
      <div
        role="radiogroup"
        aria-label={label}
        className="inline-flex rounded-xl focus-within:ring-2 focus-within:ring-coral focus-within:ring-offset-2 focus-within:ring-offset-paper"
        onMouseLeave={() => setHoverValue(null)}
      >
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const fill = Math.max(0, Math.min(1, displayValue - (star - 1)));

            return (
              <span
                key={star}
                className={cn("relative inline-block shrink-0", starSize)}
              >
                <span aria-hidden="true" className="absolute inset-0">
                  <Star
                    className={cn(
                      "absolute inset-0 fill-transparent stroke-ink",
                      starSize,
                    )}
                    strokeWidth={1.8}
                  />
                  <span
                    className="absolute inset-y-0 left-0 overflow-hidden"
                    style={{ width: `${fill * 100}%` }}
                  >
                    <Star
                      className={cn("fill-butter stroke-ink", starSize)}
                      strokeWidth={1.8}
                    />
                  </span>
                </span>

                {interactive &&
                  [star - 0.5, star].map((option) => (
                    <label
                      key={option}
                      className={cn(
                        "absolute inset-y-0 z-10 w-1/2 cursor-pointer",
                        option === star ? "left-1/2" : "left-0",
                      )}
                      onMouseEnter={() => setHoverValue(option)}
                    >
                      <input
                        id={`${groupName}-${option}`}
                        type="radio"
                        name={groupName}
                        value={option}
                        checked={value === option}
                        onChange={() => onChange?.(option)}
                        className="sr-only"
                        aria-label={`${option.toFixed(1)}점`}
                      />
                    </label>
                  ))}
              </span>
            );
          })}
        </div>
      </div>

      <span
        aria-live="polite"
        className="text-sm font-bold tabular-nums text-ink/55"
      >
        {value > 0 ? `${value.toFixed(1)} / 5` : "별점을 선택해주세요"}
      </span>
    </div>
  );
}
