"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, api, isUnauthorizedError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AnimeItem, Category, Profile } from "@/lib/types";
import { AppHeader } from "./app-header";
import { BackgroundDecor } from "./decorations";
import { CategoryStep } from "./category-step";
import { LoginStep } from "./login-step";
import { ProfileStep } from "./profile-step";
import { ResultStep } from "./result-step";
import { BootingCard, DrawingCard, ErrorCard } from "./status-cards";
import { Toast, type ToastState, type ToastTone } from "./toast";

type Screen =
  | "booting"
  | "login"
  | "profiles"
  | "categories"
  | "drawing"
  | "result"
  | "error";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export function ChallengeApp() {
  const queryClient = useQueryClient();

  const [sessionEnded, setSessionEnded] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [currentItem, setCurrentItem] = useState<AnimeItem | null>(null);
  const [drawnIds, setDrawnIds] = useState<Set<number>>(new Set());
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [pendingDraw, setPendingDraw] = useState(false);
  const [poolExhausted, setPoolExhausted] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const toastSequence = useRef(0);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      toastSequence.current += 1;
      setToast({ id: toastSequence.current, message, tone });
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const resetRound = useCallback(() => {
    setCategory(null);
    setCurrentItem(null);
    setDrawnIds(new Set());
    setRating(0);
    setReview("");
    setPendingDraw(false);
    setPoolExhausted(false);
  }, []);

  const goToLogin = useCallback(() => {
    setSessionEnded(true);
    setSelectedProfile(null);
    resetRound();
    queryClient.clear();
  }, [queryClient, resetRound]);

  const goToProfiles = useCallback(() => {
    setSelectedProfile(null);
    resetRound();
    queryClient.removeQueries({ queryKey: ["items"] });
  }, [queryClient, resetRound]);

  const profilesQuery = useQuery({
    queryKey: queryKeys.profiles,
    queryFn: api.getProfiles,
    enabled: !sessionEnded,
    retry: false,
    staleTime: 60 * 1000,
  });

  const itemsQuery = useQuery({
    queryKey: queryKeys.items(
      category ?? "recent",
      selectedProfile?.userId ?? 0,
    ),
    queryFn: () => api.getItems(category as Category, selectedProfile!.userId),
    enabled: Boolean(category && selectedProfile),
    staleTime: 5 * 60 * 1000,
  });

  const profileMutation = useMutation({
    mutationFn: (profileId: number) => api.selectProfile(profileId),
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        goToLogin();
        showToast(
          "로그인이 만료됐어요. 다시 로그인해주세요.",
          "error",
        );
        return;
      }

      showToast(
        getErrorMessage(error, "프로필을 선택하지 못했어요."),
        "error",
      );
    },
  });

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: () => {
      profileMutation.reset();
      setSessionEnded(false);
      setSelectedProfile(null);
      resetRound();
      queryClient.removeQueries();

      void queryClient
        .fetchQuery({
          queryKey: queryKeys.profiles,
          queryFn: api.getProfiles,
          staleTime: 0,
        })
        .catch(() => undefined);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      loginMutation.reset();
      goToLogin();
      showToast("로그아웃했어요.", "info");
    },
    onError: (error) => {
      showToast(getErrorMessage(error, "로그아웃하지 못했어요."), "error");
    },
  });

  useEffect(() => {
    if (!pendingDraw || !itemsQuery.data) return;

    const timer = window.setTimeout(() => {
      const pool = itemsQuery.data?.items ?? [];
      const available = pool.filter((item) => !drawnIds.has(item.id));

      if (available.length === 0) {
        setPendingDraw(false);

        if (pool.length > 0) {
          setPoolExhausted(true);
        }

        return;
      }

      const picked = available[Math.floor(Math.random() * available.length)];

      setCurrentItem(picked);
      setDrawnIds((current) => {
        const next = new Set(current);
        next.add(picked.id);
        return next;
      });
      setRating(0);
      setReview("");
      setPendingDraw(false);
    }, 850);

    return () => window.clearTimeout(timer);
  }, [pendingDraw, itemsQuery.data, drawnIds]);

  const handleLogin = (email: string, password: string) => {
    loginMutation.mutate({ email, password });
  };

  const handleSelectProfile = (profile: Profile) => {
    profileMutation.mutate(profile.id, {
      onSuccess: () => {
        setSelectedProfile(profile);
        resetRound();
        queryClient.removeQueries({ queryKey: ["items"] });
      },
    });
  };

  const handleSelectCategory = (nextCategory: Category) => {
    if (nextCategory === category) return;

    setCategory(nextCategory);
    setCurrentItem(null);
    setDrawnIds(new Set());
    setRating(0);
    setReview("");
    setPendingDraw(false);
    setPoolExhausted(false);
  };

  const handleDraw = () => {
    if (!category || !selectedProfile) return;

    setPoolExhausted(false);
    setPendingDraw(true);
  };

  const handleRedraw = () => {
    if (!category) return;

    setCurrentItem(null);
    setRating(0);
    setReview("");
    setPendingDraw(true);
  };

  const handleResetPool = () => {
    setDrawnIds(new Set());
    setPoolExhausted(false);
    setPendingDraw(true);
  };

  const handleBackToCategories = () => {
    setCurrentItem(null);
    setRating(0);
    setReview("");
    setPendingDraw(false);
    setPoolExhausted(false);
  };

  const profiles = profilesQuery.data?.profiles ?? [];
  const profilesError = profilesQuery.error;
  const profilesUnauthorized = isUnauthorizedError(profilesError);
  const itemsUnauthorized = isUnauthorizedError(itemsQuery.error);
  const showLogin = sessionEnded || profilesUnauthorized || itemsUnauthorized;
  const showError = !showLogin && Boolean(profilesError);
  const isBooting =
    !showLogin &&
    !showError &&
    (profilesQuery.isPending ||
      (loginMutation.isSuccess &&
        profilesQuery.isFetching &&
        profiles.length === 0));
  const effectivePendingDraw = pendingDraw && !itemsQuery.isError;
  const loginNotice = itemsUnauthorized
    ? "로그인이 만료됐어요. 다시 로그인해주세요."
    : profilesUnauthorized && profiles.length > 0
      ? "로그인이 만료됐어요. 다시 로그인해주세요."
      : null;

  let screen: Screen;

  if (showLogin) {
    screen = "login";
  } else if (showError) {
    screen = "error";
  } else if (isBooting) {
    screen = "booting";
  } else if (!selectedProfile) {
    screen = "profiles";
  } else if (!category) {
    screen = "categories";
  } else if (effectivePendingDraw) {
    screen = "drawing";
  } else if (currentItem) {
    screen = "result";
  } else {
    screen = "categories";
  }

  const profilesErrorMessage = getErrorMessage(
    profilesError,
    "프로필을 불러오지 못했어요.",
  );
  const poolErrorMessage = itemsQuery.error
    ? getErrorMessage(itemsQuery.error, "작품 목록을 불러오지 못했어요.")
    : null;
  const isPoolLoading = Boolean(
    category &&
      selectedProfile &&
      itemsQuery.isPending &&
      !itemsQuery.data,
  );
  const poolCount = itemsQuery.data?.items.length ?? null;

  const loginErrorMessage = loginMutation.error
    ? getErrorMessage(loginMutation.error, "로그인에 실패했어요.")
    : null;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <BackgroundDecor />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-5 sm:px-6 sm:py-8">
        <AppHeader
          loggedIn={!showLogin && Boolean(profilesQuery.data)}
          profile={selectedProfile}
          isLoggingOut={logoutMutation.isPending || profileMutation.isPending}
          onLogout={() => logoutMutation.mutate()}
        />

        <div className="flex flex-1 flex-col py-6 sm:py-10">
          <div className="m-auto flex w-full justify-center">
            {screen === "booting" ? <BootingCard /> : null}

            {screen === "login" ? (
              <LoginStep
                onSubmit={handleLogin}
                onClearError={() => loginMutation.reset()}
                isPending={loginMutation.isPending}
                errorMessage={loginErrorMessage}
                notice={loginNotice}
              />
            ) : null}

            {screen === "profiles" ? (
              <ProfileStep
                profiles={profiles}
                isFetching={profilesQuery.isFetching}
                isSelecting={profileMutation.isPending}
                selectingProfileId={profileMutation.variables ?? null}
                errorMessage={null}
                onSelect={handleSelectProfile}
                onRetry={() => {
                  void profilesQuery.refetch();
                }}
              />
            ) : null}

            {screen === "categories" && selectedProfile ? (
              <CategoryStep
                profile={selectedProfile}
                category={category}
                onSelectCategory={handleSelectCategory}
                onDraw={handleDraw}
                poolCount={poolCount}
                isPoolLoading={isPoolLoading}
                poolError={poolErrorMessage}
                onRetryPool={() => {
                  void itemsQuery.refetch();
                }}
                poolExhausted={poolExhausted}
                onResetPool={handleResetPool}
                onChangeProfile={goToProfiles}
              />
            ) : null}

            {screen === "drawing" ? (
              <DrawingCard isPoolLoading={isPoolLoading} />
            ) : null}

            {screen === "result" && currentItem && category ? (
              <ResultStep
                key={currentItem.id}
                item={currentItem}
                category={category}
                rating={rating}
                review={review}
                onRatingChange={setRating}
                onReviewChange={setReview}
                onRedraw={handleRedraw}
                onChangeCategory={handleBackToCategories}
                onChangeProfile={goToProfiles}
                onToast={showToast}
                drawnCount={drawnIds.size}
                poolCount={poolCount ?? 0}
              />
            ) : null}

            {screen === "error" ? (
              <ErrorCard
                message={profilesErrorMessage}
                onRetry={() => {
                  void profilesQuery.refetch();
                }}
                onLogin={goToLogin}
                isRetrying={profilesQuery.isFetching}
              />
            ) : null}
          </div>
        </div>

        <footer className="relative z-10 mt-2 pb-2 text-center text-[10px] leading-5 font-bold text-ink/35">
          <p>라프텔 공식 서비스가 아니에요 · 팬메이드 프로젝트</p>
          <p>Font. 온글잎 박다현체</p>
          <p>Github: Bananamilk452/laftelrandomchallenge</p>
        </footer>
      </main>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
