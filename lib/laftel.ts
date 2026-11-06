import type { AnimeItem, Category, ItemPool, Profile } from "./types";

const LAFTEL_API_BASE = "https://api.laftel.net/api";
const LAFTEL_IMAGE_HOST = "thumbnail.laftel.net";
const PAGE_SIZE = 100;
const MAX_POOL_SIZE = 300;
const REQUEST_TIMEOUT_MS = 12_000;

type LaftelProfile = {
  id?: number;
  user_id?: number;
  name?: string;
  image?: string | null;
  is_main?: boolean;
};

type LaftelProfileToken = {
  id?: number;
  token?: string;
  user_id?: number;
};

type LaftelImage = {
  option_name?: string;
  img_url?: string;
};

type LaftelItem = {
  id?: number;
  name?: string;
  img?: string;
  images?: LaftelImage[];
  avg_rating?: number;
  genre?: string[];
  genres?: string[];
  tag?: string[];
};

type LaftelWishItem = {
  id?: number;
  item?: LaftelItem;
  value?: unknown;
};

type LaftelListResponse<T> = {
  count?: number;
  results?: T[];
};

export class LaftelApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "LaftelApiError";
    this.status = status;
  }
}

function extractMessage(data: unknown) {
  if (!data || typeof data !== "object") return null;

  if ("detail" in data) {
    const detail = (data as { detail?: unknown }).detail;

    if (typeof detail === "string" && detail.trim()) return detail;
    if (detail && typeof detail === "object" && "message" in detail) {
      const message = (detail as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;
    }
  }

  if ("message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return null;
}

async function laftelRequest<T>(
  path: string,
  options: {
    token?: string;
    method?: "GET" | "POST";
    body?: unknown;
  } = {},
) {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.token) {
    headers.Authorization = `Token ${options.token}`;
  }

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${LAFTEL_API_BASE}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const data = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      throw new LaftelApiError(
        response.status,
        extractMessage(data) ?? "라프텔 요청을 처리하지 못했어요.",
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof LaftelApiError) throw error;

    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new LaftelApiError(504, "라프텔 응답이 너무 늦어요.");
    }

    throw new LaftelApiError(502, "라프텔에 연결할 수 없어요.");
  }
}

function normalizeImageUrl(value: string | null | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (url.protocol === "http:") url.protocol = "https:";
    if (url.protocol !== "https:" || url.hostname !== LAFTEL_IMAGE_HOST) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function pickImage(item: LaftelItem) {
  const images = item.images ?? [];
  const preferred = [
    ...images.filter((image) => image.option_name === "home_custom"),
    ...images.filter((image) => image.option_name === "home_default"),
    ...images,
  ];

  for (const image of preferred) {
    const normalized = normalizeImageUrl(image.img_url);
    if (normalized) return normalized;
  }

  return normalizeImageUrl(item.img);
}

function unwrapItem(item: LaftelItem | LaftelWishItem): LaftelItem | null {
  if ("item" in item) {
    if (
      item.item &&
      typeof item.item === "object" &&
      "id" in item.item
    ) {
      return item.item;
    }

    return null;
  }

  return item as LaftelItem;
}

function normalizeItem(item: LaftelItem): AnimeItem | null {
  const id = Number(item.id);

  if (!Number.isFinite(id)) return null;

  const genres = Array.isArray(item.genres)
    ? item.genres
    : Array.isArray(item.genre)
      ? item.genre
      : Array.isArray(item.tag)
        ? item.tag
        : [];

  return {
    id,
    title: typeof item.name === "string" && item.name.trim() ? item.name.trim() : "제목 없는 작품",
    image: pickImage(item),
    averageRating:
      typeof item.avg_rating === "number" && Number.isFinite(item.avg_rating)
        ? item.avg_rating
        : null,
    genres: genres.filter((genre): genre is string => typeof genre === "string").slice(0, 4),
  };
}

export async function loginLaftel(email: string, password: string) {
  return laftelRequest<{ key: string }>("/authentications/v3/email/", {
    method: "POST",
    body: {
      username: email,
      password,
    },
  });
}

export async function getProfiles(token: string): Promise<Profile[]> {
  const data = await laftelRequest<LaftelListResponse<LaftelProfile>>(
    "/profiles/v2/list/",
    { token },
  );

  return (data.results ?? []).flatMap((profile) => {
    const id = Number(profile.id);
    const userId = Number(profile.user_id);

    if (!Number.isFinite(id) || !Number.isFinite(userId)) return [];

    return [
      {
        id,
        userId,
        name:
          typeof profile.name === "string" && profile.name.trim()
            ? profile.name.trim()
            : "이름 없는 프로필",
        image: normalizeImageUrl(profile.image),
        isMain: Boolean(profile.is_main),
      },
    ];
  });
}

function getPoolConfig(category: Category, profileId: number) {
  switch (category) {
    case "recent":
      return {
        path: `/users/v2/${profileId}/playhistory_set/`,
        query: "sorting=recent",
      };
    case "finished":
      return {
        path: "/items/v1/finished/",
        query: "sorting=view",
      };
    case "wish":
      return {
        path: "/items/v1/wish_item/",
        query: "sorting=add",
      };
  }
}

export async function getProfileToken(
  accountToken: string,
  profileId: number,
): Promise<{ token: string; userId: number }> {
  const data = await laftelRequest<LaftelProfileToken>(
    `/profiles/v1/${profileId}/token/`,
    { token: accountToken },
  );

  const token = typeof data.token === "string" ? data.token : "";
  const userId = Number(data.user_id);

  if (!token || !Number.isFinite(userId)) {
    throw new LaftelApiError(502, "프로필 토큰을 확인하지 못했어요.");
  }

  return { token, userId };
}

export async function getItemPool(
  token: string,
  category: Category,
  profileId: number,
): Promise<ItemPool> {
  const config = getPoolConfig(category, profileId);
  const firstPage = await laftelRequest<
    LaftelListResponse<LaftelItem | LaftelWishItem>
  >(`${config.path}?${config.query}&limit=${PAGE_SIZE}&offset=0`, { token });

  const total = Number(firstPage.count ?? firstPage.results?.length ?? 0);
  const pageCount = Math.min(
    Math.max(1, Math.ceil(total / PAGE_SIZE)),
    Math.ceil(MAX_POOL_SIZE / PAGE_SIZE),
  );

  const pages = [firstPage];

  if (pageCount > 1) {
    const rest = await Promise.all(
      Array.from({ length: pageCount - 1 }, (_, index) =>
        laftelRequest<LaftelListResponse<LaftelItem | LaftelWishItem>>(
          `${config.path}?${config.query}&limit=${PAGE_SIZE}&offset=${(index + 1) * PAGE_SIZE}`,
          { token },
        ),
      ),
    );

    pages.push(...rest);
  }

  const seen = new Set<number>();
  const items: AnimeItem[] = [];

  for (const page of pages) {
    for (const rawItem of page.results ?? []) {
      const unwrapped = unwrapItem(rawItem);

      if (!unwrapped) continue;

      const item = normalizeItem(unwrapped);

      if (!item || seen.has(item.id)) continue;

      seen.add(item.id);
      items.push(item);

      if (items.length >= MAX_POOL_SIZE) break;
    }

    if (items.length >= MAX_POOL_SIZE) break;
  }

  return {
    items,
    count: total,
  };
}

export function isLaftelImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === LAFTEL_IMAGE_HOST;
  } catch {
    return false;
  }
}
