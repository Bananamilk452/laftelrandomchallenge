import { LaftelApiError, getItemPool } from "@/lib/laftel";
import { clearAllSessions, getProfileSession } from "@/lib/session";
import type { Category } from "@/lib/types";

const CATEGORIES = new Set<Category>(["recent", "finished", "wish"]);

function json(message: string, status: number) {
  return Response.json(
    { message },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}

function isCategory(value: string | null): value is Category {
  return value !== null && CATEGORIES.has(value as Category);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const userId = Number(searchParams.get("userId"));

  if (!isCategory(category)) {
    return json("카테고리를 확인해주세요.", 400);
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    return json("프로필을 확인해주세요.", 400);
  }

  const session = await getProfileSession();

  if (!session) {
    return json("프로필을 먼저 선택해주세요.", 401);
  }

  if (session.userId !== userId) {
    return json("선택한 프로필과 일치하지 않아요.", 400);
  }

  try {
    const pool = await getItemPool(session.token, category, userId);

    return Response.json(pool, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof LaftelApiError) {
      if (error.status === 401) {
        await clearAllSessions();
        return json("로그인이 만료됐어요. 다시 로그인해주세요.", 401);
      }

      if (error.status === 504) {
        return json("라프텔 응답이 너무 늦어요. 다시 시도해주세요.", 504);
      }
    }

    return json("작품 목록을 불러오지 못했어요.", 502);
  }
}
