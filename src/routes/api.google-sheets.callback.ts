import { createFileRoute } from "@tanstack/react-router";
import { completeGoogleSheetsOAuth } from "@/lib/data/google-sheets";

export const Route = createFileRoute("/api/google-sheets/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        if (error) {
          return Response.redirect(new URL("/settings?googleSheets=error", url.origin), 302);
        }
        if (!code || !state) {
          return Response.redirect(new URL("/settings?googleSheets=invalid", url.origin), 302);
        }

        try {
          await completeGoogleSheetsOAuth({ data: { code, state } });
          return Response.redirect(new URL("/settings?googleSheets=connected", url.origin), 302);
        } catch (err) {
          console.error("[google-sheets] oauth callback failed", err);
          return Response.redirect(new URL("/settings?googleSheets=error", url.origin), 302);
        }
      },
    },
  },
});
