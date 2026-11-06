import { isLaftelImageUrl } from "@/lib/laftel";

const REQUEST_TIMEOUT_MS = 12_000;

function text(message: string, status: number) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src");

  if (!src) {
    return text("이미지 주소가 필요해요.", 400);
  }

  if (!isLaftelImageUrl(src)) {
    return text("허용되지 않은 이미지 주소예요.", 400);
  }

  try {
    const upstream = await fetch(src, {
      headers: {
        Accept: "image/*",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!upstream.ok || !upstream.body) {
      return text("이미지를 불러오지 못했어요.", upstream.status === 404 ? 404 : 502);
    }

    if (!isLaftelImageUrl(upstream.url)) {
      return text("허용되지 않은 이미지 주소예요.", 400);
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";

    if (!contentType.startsWith("image/")) {
      return text("이미지 형식이 아니에요.", 502);
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return text("이미지 응답이 너무 늦어요.", 504);
    }

    return text("이미지를 불러오지 못했어요.", 502);
  }
}
