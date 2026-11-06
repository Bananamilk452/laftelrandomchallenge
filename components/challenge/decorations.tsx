import { Dices, Heart, Sparkles, Star } from "lucide-react";

export function BackgroundDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <Star className="absolute left-[4%] top-[14%] hidden h-10 w-10 -rotate-12 fill-butter text-ink/70 sm:block" />
      <Heart className="absolute right-[7%] top-[17%] hidden h-8 w-8 rotate-12 fill-blush text-ink/60 md:block" />
      <Sparkles className="animate-sparkle-spin absolute left-[10%] top-[62%] h-8 w-8 text-mint" />
      <Star className="absolute bottom-[12%] right-[10%] h-7 w-7 rotate-12 fill-butter text-ink/50" />

      <div className="animate-float-soft absolute right-[4%] top-[38%] hidden w-36 rotate-6 rounded-2xl border-2 border-ink bg-paper p-3 shadow-[4px_4px_0_var(--ink)] lg:block">
        <div className="flex items-center gap-1.5">
          <Dices className="h-4 w-4" />
          <span className="text-xs font-bold">오늘의 애니는?</span>
        </div>
        <p className="mt-2 text-[11px] leading-4 text-ink/55">
          운명에게 맡겨보는
          <br />
          랜덤 애니 챌린지
        </p>
      </div>

      <div className="absolute bottom-[18%] left-[3%] hidden w-28 -rotate-6 rounded-xl border-2 border-ink/40 bg-butter/50 p-2 text-center lg:block">
        <p className="text-[10px] font-bold text-ink/55">TODAY&apos;S PICK</p>
        <p className="text-lg font-bold text-ink/70">★ ★ ★</p>
      </div>
    </div>
  );
}
