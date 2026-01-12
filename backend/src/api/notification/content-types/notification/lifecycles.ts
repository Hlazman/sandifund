import { sendToTokens, slateToText } from "../../../../services/push/expo";

declare const strapi: any;

function notificationUsesDraftAndPublish(): boolean {
  try {
    const ct = strapi?.contentTypes?.["api::notification.notification"];
    return Boolean(ct?.options?.draftAndPublish);
  } catch {
    return false;
  }
}

async function notifyUsers(notification: any): Promise<void> {
  const locale = notification?.locale || "en";

  const users = await strapi.entityService.findMany("api::user-info.user-info", {
    filters: { language: locale },
    fields: ["documentId", "pushTokens"],
    pagination: { page: 1, pageSize: 1000 },
  });

  const tokens = (users || [])
    .flatMap((u: any) => (Array.isArray(u.pushTokens) ? u.pushTokens : []))
    .filter(Boolean);

  if (!tokens.length) {
    strapi?.log?.info?.(
      `[push:notification] skip: no tokens for locale=${locale} (users=${(users || []).length})`
    );
    return;
  }

  strapi?.log?.info?.(
    `[push:notification] target: locale=${locale} users=${(users || []).length} tokens=${tokens.length}`
  );

  const title = notification?.title || "New notification";
  const body = (slateToText(notification?.text) || "").slice(0, 180);

  await sendToTokens(tokens, {
    title,
    body,
    data: {
      notificationId: notification?.documentId,
      link: notification?.link || null,
      locale,
    },
  });
}

export default {
  async beforeUpdate(event: any) {
    // If draft/publish is disabled, there is no publish transition to detect.
    if (!notificationUsesDraftAndPublish()) return;

    const id = event.params.where?.id;
    if (!id) return;

    const prev = await strapi.entityService.findOne("api::notification.notification", id, {
      fields: ["publishedAt"],
    });

    event.state = event.state || {};
    event.state.prevPublishedAt = prev?.publishedAt ?? null;
  },

  async afterUpdate(event: any) {
    if (!notificationUsesDraftAndPublish()) return;

    const n = event.result;
    const prevPublishedAt = event.state?.prevPublishedAt ?? null;

    // Publish: null -> not null
    if (!prevPublishedAt && n?.publishedAt) {
      strapi?.log?.info?.(
        `[push:notification] publish detected via afterUpdate (id=${n?.id ?? "?"}, locale=${n?.locale ?? "en"})`
      );
      await notifyUsers(n);
    }
  },

  async afterCreate(event: any) {
    const n = event.result;

    if (notificationUsesDraftAndPublish()) {
      // If entry is created already published (or Strapi creates published version as create)
      if (n?.publishedAt) {
        strapi?.log?.info?.(
          `[push:notification] publish detected via afterCreate (id=${n?.id ?? "?"}, locale=${n?.locale ?? "en"})`
        );
        await notifyUsers(n);
      }
      return;
    }

    // draftAndPublish is disabled in this content-type -> treat create as "published"
    strapi?.log?.info?.(
      `[push:notification] draftAndPublish=false -> send on create (id=${n?.id ?? "?"}, locale=${n?.locale ?? "en"})`
    );
    await notifyUsers(n);
  },
};
