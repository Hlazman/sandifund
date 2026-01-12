import { Expo } from "expo-server-sdk";

declare const strapi: any;

const expo = new Expo();

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

      // Optional: if receipts[i]?.details?.error === 'DeviceNotRegistered' -> delete token from DB
      void receipts;
    } catch (e) {
      strapi?.log?.error?.("Expo push send error", e);
    }
  }
}
