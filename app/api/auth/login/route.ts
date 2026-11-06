import { LaftelApiError, loginLaftel } from "@/lib/laftel";
import { clearAllSessions, setAccountToken } from "@/lib/session";

type LoginBody = {
  email?: unknown;
  password?: unknown;
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
  const body = (await request.json().catch(() => null)) as LoginBody | null;

  if (!body) {
    return json("요청 형식이 올바르지 않아요.", 400);
  }

  const email =
    typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  const password =
    typeof body.password === "string" ? body.password.slice(0, 200) : "";

  if (!email || !password) {
    return json("이메일과 비밀번호를 입력해주세요.", 400);
  }

  try {
    const data = await loginLaftel(email, password);
    const key = data.key;

    if (!key) {
      return json("라프텔 로그인 응답을 확인하지 못했어요.", 502);
    }

    await clearAllSessions();
    await setAccountToken(key);

    return Response.json(
      { ok: true },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    if (error instanceof LaftelApiError) {
      if (error.status === 400 || error.status === 401) {
        return json("이메일 또는 비밀번호를 확인해주세요.", 401);
      }

      if (error.status === 429) {
        return json("로그인 시도가 너무 많아요. 잠시 후 다시 시도해주세요.", 429);
      }

      if (error.status === 504) {
        return json("라프텔 응답이 너무 늦어요. 다시 시도해주세요.", 504);
      }
    }

    return json("라프텔 로그인에 실패했어요. 잠시 후 다시 시도해주세요.", 502);
  }
}
