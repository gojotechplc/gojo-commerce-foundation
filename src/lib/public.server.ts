import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { contactMessages } from "../../db/schema";
import {
  loadAboutPage,
  loadCapabilityBySlug,
  loadContactPage,
  loadGlobalMeta,
  loadGojoShopPage,
  loadHomePage,
  loadPartnershipsPage,
  loadSiteChrome,
  loadWhatWeDoPage,
} from "./content.server";
import { parseContactMessageInput } from "./contact-message";
import { ensureSeeded, getDb } from "./db.server";

export const getSiteChromeFn = createServerFn({ method: "GET" }).handler(() => loadSiteChrome());
export const getPublicGlobalMetaFn = createServerFn({ method: "GET" }).handler(() =>
  loadGlobalMeta(),
);
export const getHomePageFn = createServerFn({ method: "GET" }).handler(() => loadHomePage());
export const getAboutPageFn = createServerFn({ method: "GET" }).handler(() => loadAboutPage());
export const getWhatWeDoPageFn = createServerFn({ method: "GET" }).handler(() => loadWhatWeDoPage());
export const getGojoShopPageFn = createServerFn({ method: "GET" }).handler(() => loadGojoShopPage());
export const getPartnershipsPageFn = createServerFn({ method: "GET" }).handler(() =>
  loadPartnershipsPage(),
);
export const getContactPageFn = createServerFn({ method: "GET" }).handler(() => loadContactPage());
export const getCapabilityPageFn = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => loadCapabilityBySlug(data.slug));

/** Public contact / partnership inquiry — validated + length-limited. */
export const submitContactMessageFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => parseContactMessageInput(d))
  .handler(async ({ data }) => {
    await ensureSeeded();
    const db = getDb();

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recent = db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.email, data.email))
      .all()
      .filter((m) => m.createdAt >= hourAgo);
    if (recent.length >= 5) {
      throw new Error("Too many messages from this email. Please try again later.");
    }

    db.insert(contactMessages)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        organization: data.organization,
        interest: data.interest,
        message: data.message,
        source: data.source,
        isRead: 0,
        createdAt: new Date().toISOString(),
      })
      .run();

    return { ok: true as const };
  });
