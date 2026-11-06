import type {
  ApiErrorBody,
  Category,
  ItemPool,
  ProfilesResponse,
} from "./types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(input, {
      ...init,
      cache: "no-store",
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });

    const data = (await response.json().catch(() => null)) as
      | (T & ApiErrorBody)
      | null;

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data?.message ?? "요청을 처리하지 못했어요.",
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(0, "네트워크 연결을 확인해주세요.");
  }
}

export const api = {
  login(input: { email: string; password: string }) {
    return request<{ ok: true }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  logout() {
    return request<{ ok: true }>("/api/auth/logout", {
      method: "POST",
    });
  },

  getProfiles() {
    return request<ProfilesResponse>("/api/profiles");
  },

  selectProfile(profileId: number) {
    return request<{ ok: true; userId: number }>("/api/auth/profile", {
      method: "POST",
      body: JSON.stringify({ profileId }),
    });
  },

  getItems(category: Category, userId: number) {
    const params = new URLSearchParams({
      category,
      userId: String(userId),
    });

    return request<ItemPool>(`/api/items?${params.toString()}`);
  },
};

export function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}
