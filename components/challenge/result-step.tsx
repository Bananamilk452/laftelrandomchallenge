"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ImageDown,
  ImageOff,
  Loader2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import type { AnimeItem, Category } from "@/lib/types";
import {
  buildCaption,
  captureCard,
  copyText,
  createShareFile,
  downloadBlob,
  isMobileDevice,
  openXShare,
  sanitizeFileName,
  shareFile,
} from "@/lib/share";
import { InstagramIcon, XIcon } from "./icons";
import { ShareCard } from "./share-card";
import { StickerButton } from "./sticker-button";
import type { ToastTone } from "./toast";

type ResultStepProps = {
  item: AnimeItem;
  category: Category;
  rating: number;
  review: string;
  onRatingChange: (value: number) => void;
  onReviewChange: (value: string) => void;
  onRedraw: () => void;
  onChangeCategory: () => void;
  onChangeProfile: () => void;
  onToast: (message: string, tone?: ToastTone) => void;
  drawnCount: number;
  poolCount: number;
};

export function ResultStep({
  item,
  category,
  rating,
  review,
  onRatingChange,
  onReviewChange,
  onRedraw,
  onChangeCategory,
  onChangeProfile,
  onToast,
  drawnCount,
  poolCount,
}: ResultStepProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const imageBlobRef = useRef<Blob | null>(null);
  const [imageBlob, setImageBlobState] = useState<Blob | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const canShare = rating > 0 && review.trim().length > 0;

  const setImageBlob = useCallback((blob: Blob | null) => {
    imageBlobRef.current = blob;
    setImageBlobState(blob);
  }, []);

  useEffect(() => {
    if (!canShare || isEditing) return;

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      if (!captureRef.current || imageBlobRef.current) return;

      setIsPreparing(true);
      setImageError(false);

      try {
        const blob = await captureCard(captureRef.current);

        if (!cancelled) {
          setImageBlob(blob);
        }
      } catch {
        if (!cancelled) {
          setImageError(true);
        }
      } finally {
        if (!cancelled) {
          setIsPreparing(false);
        }
      }
    }, 550);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [canShare, rating, review, item.id, retryKey, isEditing, setImageBlob]);

  const handleRatingChange = (value: number) => {
    setImageBlob(null);
    setIsPreparing(false);
    setImageError(false);
    onRatingChange(value);
  };

  const handleReviewChange = (value: string) => {
    setImageBlob(null);
    setIsPreparing(false);
    setImageError(false);
    onReviewChange(value);
  };

  const handleEditingChange = (editing: boolean) => {
    setIsEditing(editing);

    if (editing) {
      setIsPreparing(false);
      setImageError(false);
    }
  };

  const ensureBlob = useCallback(async () => {
    if (imageBlobRef.current) return imageBlobRef.current;
    if (!captureRef.current) return null;

    setIsPreparing(true);
    setImageError(false);

    try {
      const blob = await captureCard(captureRef.current);
      setImageBlob(blob);
      return blob;
    } catch {
      setImageError(true);
      return null;
    } finally {
      setIsPreparing(false);
    }
  }, [setImageBlob]);

  const caption = buildCaption({
    title: item.title,
    rating,
    review,
  });
  const fileName = `${sanitizeFileName(item.title)}-challenge.png`;

  const handleDownload = async () => {
    const blob = await ensureBlob();
    if (!blob) return;

    downloadBlob(blob, fileName);
    onToast("이미지를 저장했어요!");
  };

  const handleX = async () => {
    const blob = await ensureBlob();
    if (!blob) return;

    if (isMobileDevice()) {
      const handled = await shareFile(
        createShareFile(blob, item.title),
        caption,
      );

      if (handled) return;
    }

    downloadBlob(blob, fileName);
    onToast("이미지를 저장했어요. X에 첨부해주세요.", "info");
    openXShare(caption);
  };

  const handleInstagram = async () => {
    const blob = await ensureBlob();
    if (!blob) return;

    if (isMobileDevice()) {
      const handled = await shareFile(
        createShareFile(blob, item.title),
        caption,
      );

      if (handled) return;
    }

    downloadBlob(blob, fileName);
    const copied = await copyText(caption);
    onToast(
      copied
        ? "이미지를 저장하고 캡션을 복사했어요. 인스타그램에 업로드해주세요."
        : "이미지를 저장했어요. 캡션은 직접 복사해주세요.",
      "info",
    );
  };

  const handleCopy = async () => {
    const copied = await copyText(caption);

    onToast(
      copied ? "캡션을 복사했어요!" : "캡션을 복사하지 못했어요.",
      copied ? "success" : "error",
    );
  };

  const actionsDisabled = !canShare || isPreparing;

  return (
    <section className="w-full max-w-[520px] animate-pop-in">
      <div className="mb-1 flex items-center justify-between px-4 text-[10px] font-bold tracking-[0.12em] text-ink/35">
        <span>오늘의 {drawnCount}번째 픽</span>
        <span>{poolCount}편 중에서</span>
      </div>

      <div className="flex justify-center">
        <ShareCard
          ref={captureRef}
          item={item}
          category={category}
          rating={rating}
          review={review}
          onRatingChange={handleRatingChange}
          onReviewChange={handleReviewChange}
          onEditingChange={handleEditingChange}
        />
      </div>

      <div className="mx-auto mt-4 w-full max-w-[480px]">
        <div className="min-h-6 text-center">
          {!canShare ? (
            <p className="text-[11px] font-bold text-ink/45">
              별점과 한줄평을 채우면 이미지 저장과 공유를 할 수 있어요.
            </p>
          ) : null}

          {canShare && isPreparing ? (
            <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-ink/45">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              공유 이미지를 만들고 있어요...
            </p>
          ) : null}

          {canShare && imageError ? (
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-ink/55">
              <ImageOff className="h-3.5 w-3.5" />
              이미지를 만들지 못했어요.
              <button
                type="button"
                onClick={() => setRetryKey((current) => current + 1)}
                className="inline-flex items-center gap-1 underline underline-offset-4"
              >
                <RefreshCw className="h-3 w-3" />
                다시 시도
              </button>
            </div>
          ) : null}

          {canShare && imageBlob && !isPreparing && !imageError ? (
            <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-ink/40">
              <CheckCircle2 className="h-3.5 w-3.5" />
              공유 이미지가 준비됐어요.
            </p>
          ) : null}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2.5">
          <StickerButton
            tone="mint"
            disabled={actionsDisabled}
            onClick={handleDownload}
          >
            <ImageDown className="h-4 w-4" />
            이미지 저장
          </StickerButton>

          <StickerButton
            tone="butter"
            disabled={actionsDisabled}
            onClick={handleX}
          >
            <XIcon className="h-4 w-4" />X에 공유
          </StickerButton>

          <StickerButton
            tone="blush"
            disabled={actionsDisabled}
            onClick={handleInstagram}
          >
            <InstagramIcon className="h-4 w-4" />
            인스타그램
          </StickerButton>

          <StickerButton
            tone="paper"
            disabled={!canShare}
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
            캡션 복사
          </StickerButton>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <StickerButton tone="coral" onClick={onRedraw}>
            <RotateCcw className="h-4 w-4" />
            다시 뽑기
          </StickerButton>

          <StickerButton tone="paper" onClick={onChangeCategory}>
            <ArrowLeft className="h-4 w-4" />
            카테고리 바꾸기
          </StickerButton>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onChangeProfile}
            className="text-[11px] font-bold text-ink/35 underline-offset-4 hover:text-ink/60 hover:underline"
          >
            프로필 다시 선택
          </button>
        </div>
      </div>
    </section>
  );
}
