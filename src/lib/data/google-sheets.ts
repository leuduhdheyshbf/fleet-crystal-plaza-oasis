import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { createGoogleSheetsAuthUrl, disconnectGoogleSheets, finishGoogleSheetsOAuth, getGoogleSheetsStatus, syncTableToGoogleSheet } from "@/lib/google-sheets.server";

export const getGoogleSheetsAuthUrl = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => createGoogleSheetsAuthUrl(context.userId));

export const getGoogleSheetsConnection = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => getGoogleSheetsStatus(context.userId));

export const disconnectGoogleSheetsConnection = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await disconnectGoogleSheets(context.userId);
    return { ok: true };
  });

export const completeGoogleSheetsOAuth = createServerFn({ method: "GET" })
  .handler(async ({ data }) => finishGoogleSheetsOAuth(data.code, data.state));

export const syncWorkspaceTableToGoogle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) =>
    syncTableToGoogleSheet(
      context.userId,
      data.tableId,
      data.spreadsheetId,
      data.sheetName,
      data.snapshot,
    ),
  );
