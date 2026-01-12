import { Expo } from "expo-server-sdk";

declare const strapi: any;

const expo = new Expo();

function maskToken(token: string): string {
  if (!token) return "";
  if (token.length <= 16) return token;
  return `${token.slice(0, 10)}…${token.slice(-6)}`;
}

// Compress Slate-like JSON -> short plain text
export function slateToText(value: unknown): string {
  try {
    if (!Array.isArray(value)) return "";

    const walk = (node: any): string => {
      if (!node) return "";
      if (typeof node.text === "string") return node.text;
      if (Array.isArray(node.children)) return node.children.map(walk).join("");
      return "";
    };

    return value
      .map(walk)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } catch {
    return "";
  }
}

export async function sendToTokens(
  tokens: string[],
  {
    title,
    body,
    data,
  }: {
    title?: string;
    body?: string;
    data?: Record<string, any>;
  }
): Promise<void> {
  const messages: any[] = [];
  let invalidTokenCount = 0;

  for (const pushToken of tokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      invalidTokenCount += 1;
      continue;
    }

    messages.push({
      to: pushToken,
      sound: "default",
      title,
      body,
      data,
    });
  }

  if (!messages.length) {
    strapi?.log?.info?.(
      `[push:expo] skip: no valid Expo tokens (input=${tokens.length}, invalid=${invalidTokenCount})`
    );
    return;
  }

  strapi?.log?.info?.(
    `[push:expo] sending: total=${messages.length} (input=${tokens.length}, invalid=${invalidTokenCount})`
  );

  const chunks = expo.chunkPushNotifications(messages);

  strapi?.log?.info?.(`[push:expo] chunked into ${chunks.length} request(s)`);

  for (const chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);

      let okCount = 0;
      let errorCount = 0;

      for (let i = 0; i < receipts.length; i += 1) {
        const r: any = receipts[i];
        const to = (chunk[i] as any)?.to;

        if (r?.status === "ok") {
          okCount += 1;
          continue;
        }

        errorCount += 1;
        const expoError = r?.details?.error;
        strapi?.log?.warn?.(
          `[push:expo] receipt error: to=${maskToken(String(to || ""))} status=${String(
            r?.status
          )} message=${String(r?.message || "")} error=${String(expoError || "")}`
        );

        // If expoError === 'DeviceNotRegistered' -> token should be removed from DB (optional)
      }

      strapi?.log?.info?.(
        `[push:expo] receipts: ok=${okCount} error=${errorCount} (chunkSize=${chunk.length})`
      );
    } catch (e) {
      strapi?.log?.error?.("Expo push send error", e);
    }
  }
}
