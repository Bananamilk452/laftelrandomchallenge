import type { ComponentProps } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

const tones = {
  coral: "bg-coral text-ink hover:bg-coral/90",
  paper: "bg-paper text-ink hover:bg-kraft",
  butter: "bg-butter text-ink hover:bg-butter/90",
  mint: "bg-mint text-ink hover:bg-mint/90",
  blush: "bg-blush text-ink hover:bg-blush/90",
  ghost:
    "border-transparent bg-transparent text-ink shadow-none hover:border-transparent hover:bg-ink/5",
} as const;

export type StickerButtonTone = keyof typeof tones;

type StickerButtonProps = ComponentProps<typeof Button> & {
  tone?: StickerButtonTone;
};

export function StickerButton({
  tone = "coral",
  className,
  type = "button",
  ...props
}: StickerButtonProps) {
  return (
    <Button
      type={type}
      variant="outline"
      className={cn(
        "h-11 rounded-xl border-2 border-ink px-4 text-base font-bold shadow-[3px_3px_0_var(--ink)] transition-all hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
