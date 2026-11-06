import { getFontEmbedCSS, toBlob } from "html-to-image";
import { SERVICE_URL } from "./site";

export const SHARE_HASHTAGS =
  "#랜덤라프텔챌린지 #라프텔 #라프텔챌린지 #애니추천";

const FALLBACK_FILE_NAME = "laftel-challenge";

let fontEmbedCSSPromise: Promise<string> | null = null;

export function buildCaption({
  title,
  rating,
  review,
}: {
  title: string;
  rating: number;
  review: string;
}) {
  return [
    "🎲 랜덤 라프텔 챌린지",
    `오늘 뽑힌 애니는 「${title}」!`,
    `⭐ ${rating.toFixed(1)} / 5`,
    `“${review.trim()}”`,
    "",
    SERVICE_URL,
    "",
    SHARE_HASHTAGS,
  ].join("\n");
}

export function sanitizeFileName(title: string) {
  const cleaned = title
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);

  return cleaned || FALLBACK_FILE_NAME;
}

function getCachedFontEmbedCSS(node: HTMLElement) {
  if (!fontEmbedCSSPromise) {
    fontEmbedCSSPromise = getFontEmbedCSS(node).catch(() => "");
  }

  return fontEmbedCSSPromise;
}

export async function captureCard(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready;

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  const fontEmbedCSS = await getCachedFontEmbedCSS(node);
  const blob = await toBlob(node, {
    pixelRatio: 2,
    backgroundColor: "#f7efdf",
    fontEmbedCSS: fontEmbedCSS || undefined,
    style: {
      transform: "none",
    },
  });

  if (!blob) {
    throw new Error("이미지를 만들지 못했어요.");
  }

  return blob;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function createShareFile(blob: Blob, title: string) {
  return new File([blob], `${sanitizeFileName(title)}.png`, {
    type: "image/png",
  });
}

export function canShareFile(file: File) {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  );
}

export async function shareFile(file: File, caption: string) {
  if (!canShareFile(file)) return false;

  try {
    await navigator.share({
      files: [file],
      text: caption,
      title: "랜덤 라프텔 챌린지",
    });

    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return true;
    }

    return false;
  }
}

export function isMobileDevice() {
  if (typeof navigator === "undefined") return false;

  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent))
  );
}

export function openXShare(caption: string) {
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      return copied;
    } catch {
      return false;
    }
  }
}
