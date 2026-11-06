"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { cn } from "cn";
import { imageProxySrc } from "@/lib/image";

type LaftelImageProps = {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  eager?: boolean;
  fallback?: ReactNode;
};

export function LaftelImage({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 100vw, 480px",
  eager = false,
  fallback,
}: LaftelImageProps) {
  const [failed, setFailed] = useState(false);
  const proxied = imageProxySrc(src);

  if (!proxied || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-1 bg-kraft text-center text-ink/45",
          className,
        )}
        aria-label={alt}
      >
        {fallback ?? <span className="text-xs font-bold">NO IMAGE</span>}
      </div>
    );
  }

  return (
    <Image
      src={proxied}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      loading={eager ? "eager" : undefined}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
