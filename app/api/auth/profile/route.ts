import { LaftelApiError, getProfileToken } from "@/lib/laftel";
import {
  clearAllSessions,
  getAccountToken,
  setProfileSession,
} from "@/lib/session";

type ProfileBody = {
  profileId?: unknown;
};

function json(message: string, status: number) {
  return Response.json(
    { message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ProfileBody | null;

  if (!body) {
    return json("요청 형식이 올바르지 않아요.", 400);
  }

  const profileId = Number(body.profileId);

  if (!Number.isInteger(profileId) || profileId <= 0) {
    return json("프로필을 확인해주세요.", 400);
  }

  const accountToken = await getAccountToken();

  if (!accountToken) {
    return json("로그인이 필요해요.", 401);
  }

  try {
    const profileToken = await getProfileToken(accountToken, profileId);
    await setProfileSession(profileToken.token, profileToken.userId);

    return Response.json(
      { ok: true, userId: profileToken.userId },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    if (error instanceof LaftelApiError) {
      if (error.status === 401) {
        await clearAllSessions();
        return json("로그인이 만료됐어요. 다시 로그인해주세요.", 401);
      }

      if (error.status === 403 || error.status === 404 || error.status === 400) {
        return json("선택한 프로필을 사용할 수 없어요.", 404);
      }

      if (error.status === 504) {
        return json("라프텔 응답이 너무 늦어요. 다시 시도해주세요.", 504);
      }
    }

    return json("프로필을 준비하지 못했어요. 다시 시도해주세요.", 502);
  }
}
