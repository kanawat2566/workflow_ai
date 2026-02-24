import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{ runId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { runId } = await context.params;
  const gatewayBaseUrl = process.env.GATEWAY_URL ?? process.env.NEXT_PUBLIC_GATEWAY_URL;

  if (!gatewayBaseUrl) {
    return new Response("Missing GATEWAY_URL or NEXT_PUBLIC_GATEWAY_URL", { status: 500 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${gatewayBaseUrl}/stream/${runId}`, {
      cache: "no-store",
      headers: {
        Accept: "text/event-stream",
      },
    });
  } catch {
    return new Response("Unable to connect to upstream gateway", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(`Upstream stream request failed (${upstream.status})`, {
      status: upstream.status || 502,
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
