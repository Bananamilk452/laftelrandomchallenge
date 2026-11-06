import { clearAllSessions } from "@/lib/session";

export async function POST() {
  await clearAllSessions();

  return Response.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
