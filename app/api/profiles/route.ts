import { LaftelApiError, getProfiles } from "@/lib/laftel";
import { clearAllSessions, getAccountToken } from "@/lib/session";

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

export async function GET() {
  const token = await getAccountToken();

  if (!token) {
    return json("로그인이 필요해요.", 401);
  }

  try {
    const profiles = await getProfiles(token);

    return Response.json(
      { profiles },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
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

    return json("프로필을 불러오지 못했어요.", 502);
  }
}
