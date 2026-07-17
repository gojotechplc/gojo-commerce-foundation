import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { ensureSeeded, getDb } from "./db.server";
import {
  changeAdminPassword,
  destroySession,
  getAdminSession,
  loginAdmin,
  requireAdminSession,
} from "./session.server";
import {
  aboutBlocks,
  aboutPageHeader,
  audiences,
  capabilities,
  capabilityFunctions,
  companyInfo,
  contactInterestOptions,
  contactPage,
  footerLinks,
  founders,
  globalMeta,
  gojoShopPage,
  gojoShopWorkflowImages,
  homeSections,
  logo,
  navLinks,
  pageMeta,
  partnerTypes,
  partnershipStandards,
  partnershipsPage,
  promiseItems,
  vendorValueProps,
  whatWeDoPageHeader,
  contactMessages,
} from "../../db/schema";
import {
  deleteUploadByPublicPath,
  isSafeUploadPath,
  listMediaLibrary,
  saveUpload,
  type UploadCategory,
} from "./upload.server";
import {
  normalizeMessageListFilter,
  type MessageListFilter,
} from "./contact-message";
const now = () => new Date().toISOString();

async function guard() {
  await ensureSeeded();
  return requireAdminSession();
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export const loginAdminFn = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string; password: string }) => d)
  .handler(async ({ data }) => loginAdmin(data.username, data.password));

export const logoutAdminFn = createServerFn({ method: "POST" }).handler(async () => {
  await destroySession();
  return { ok: true as const };
});

export const getAdminMeFn = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeeded();
  return getAdminSession();
});

export const changePasswordFn = createServerFn({ method: "POST" })
  .inputValidator((d: { currentPassword: string; newPassword: string }) => d)
  .handler(async ({ data }) => {
    const session = await guard();
    return changeAdminPassword(session.userId, data.currentPassword, data.newPassword);
  });

// ─── Dashboard ──────────────────────────────────────────────────────────────

export const getDashboardFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = getDb();
  const company = db.select().from(companyInfo).get();
  const unreadMessages = db
    .select()
    .from(contactMessages)
    .all()
    .filter((m) => m.isRead === 0).length;
  return {
    companyName: company?.name ?? "—",
    updatedAt: company?.updatedAt ?? null,
    counts: {
      capabilities: db.select().from(capabilities).all().length,
      founders: db.select().from(founders).all().length,
      promise: db.select().from(promiseItems).all().length,
      partners: db.select().from(partnerTypes).all().length,
      nav: db.select().from(navLinks).all().length,
      unreadMessages,
      messages: db.select().from(contactMessages).all().length,
    },
  };
});

// ─── Company ────────────────────────────────────────────────────────────────

export const getCompanyFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = getDb();
  const company = db.select().from(companyInfo).get() ?? null;
  const logos = db.select().from(logo).all();
  const primary =
    logos.find((l) => l.variant === "primary" && l.isActive === 1) ??
    logos.find((l) => l.isActive === 1) ??
    null;
  return { company, primaryLogo: primary };
});

export const updateCompanyFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      name: string;
      shortName: string;
      tagline: string;
      positioning: string;
      location: string;
      shopUrl: string;
      contactEmail: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    getDb()
      .update(companyInfo)
      .set({ ...data, updatedAt: now() })
      .where(eq(companyInfo.id, 1))
      .run();
    return { ok: true as const };
  });

/** Replace the site header/footer logo (primary + active). */
export const setCompanyLogoFn = createServerFn({ method: "POST" })
  .inputValidator((d: FormData) => d)
  .handler(async ({ data }) => {
    await guard();
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("Missing file");
    const altText = String(data.get("altText") || "Gojo Solutions logo");
    const saved = await saveUpload(file, "logo", "logo-primary");
    const db = getDb();

    // Deactivate previous primary logos so the site picks the new one
    for (const row of db.select().from(logo).all()) {
      if (row.variant === "primary" && row.isActive === 1) {
        db.update(logo).set({ isActive: 0 }).where(eq(logo.id, row.id)).run();
      }
    }

    db.insert(logo)
      .values({
        variant: "primary",
        filePath: saved.path,
        altText,
        isActive: 1,
      })
      .run();

    return { ok: true as const, path: saved.path };
  });

export const clearCompanyLogoFn = createServerFn({ method: "POST" }).handler(async () => {
  await guard();
  const db = getDb();
  for (const row of db.select().from(logo).all()) {
    if (row.variant === "primary") {
      db.update(logo).set({ isActive: 0 }).where(eq(logo.id, row.id)).run();
    }
  }
  return { ok: true as const };
});

// ─── Meta ───────────────────────────────────────────────────────────────────

export const getGlobalMetaFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  return getDb().select().from(globalMeta).get() ?? null;
});

export const updateGlobalMetaFn = createServerFn({ method: "POST" })
  .inputValidator((d: Record<string, string | null>) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb()
      .update(globalMeta)
      .set({ ...data, updatedAt: now() } as typeof globalMeta.$inferInsert)
      .where(eq(globalMeta.id, 1))
      .run();
    return { ok: true as const };
  });

export const getPageMetaListFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  return getDb().select().from(pageMeta).orderBy(asc(pageMeta.pageKey)).all();
});

export const updatePageMetaFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      pageKey: string;
      title: string;
      description: string;
      ogTitle: string;
      ogDescription: string;
      ogUrl: string;
      canonical: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    const { pageKey, ...rest } = data;
    getDb()
      .update(pageMeta)
      .set({ ...rest, updatedAt: now() })
      .where(eq(pageMeta.pageKey, pageKey))
      .run();
    return { ok: true as const };
  });

// ─── Nav ────────────────────────────────────────────────────────────────────

function reorderTable(
  table: typeof navLinks | typeof footerLinks,
  ids: number[],
) {
  const db = getDb();
  ids.forEach((id, i) => {
    db.update(table).set({ sortOrder: i, updatedAt: now() }).where(eq(table.id, id)).run();
  });
}

export const getNavFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  return getDb().select().from(navLinks).orderBy(asc(navLinks.sortOrder)).all();
});

export const createNavFn = createServerFn({ method: "POST" })
  .inputValidator((d: { label: string; href: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    const db = getDb();
    const max = db.select().from(navLinks).all().length;
    db.insert(navLinks)
      .values({ ...data, sortOrder: max, isVisible: 1 })
      .run();
    return { ok: true as const };
  });

export const updateNavFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { id: number; label: string; href: string; isVisible: number }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    const { id, ...rest } = data;
    getDb()
      .update(navLinks)
      .set({ ...rest, updatedAt: now() })
      .where(eq(navLinks.id, id))
      .run();
    return { ok: true as const };
  });

export const reorderNavFn = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => d)
  .handler(async ({ data }) => {
    await guard();
    reorderTable(navLinks, data.ids);
    return { ok: true as const };
  });

export const deleteNavFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb().delete(navLinks).where(eq(navLinks.id, data.id)).run();
    return { ok: true as const };
  });

export const getFooterNavFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  return getDb().select().from(footerLinks).orderBy(asc(footerLinks.sortOrder)).all();
});

export const createFooterNavFn = createServerFn({ method: "POST" })
  .inputValidator((d: { label: string; href: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    const db = getDb();
    const max = db.select().from(footerLinks).all().length;
    db.insert(footerLinks)
      .values({ ...data, sortOrder: max, isVisible: 1 })
      .run();
    return { ok: true as const };
  });

export const updateFooterNavFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { id: number; label: string; href: string; isVisible: number }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    const { id, ...rest } = data;
    getDb()
      .update(footerLinks)
      .set({ ...rest, updatedAt: now() })
      .where(eq(footerLinks.id, id))
      .run();
    return { ok: true as const };
  });

export const reorderFooterNavFn = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => d)
  .handler(async ({ data }) => {
    await guard();
    reorderTable(footerLinks, data.ids);
    return { ok: true as const };
  });

export const deleteFooterNavFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb().delete(footerLinks).where(eq(footerLinks.id, data.id)).run();
    return { ok: true as const };
  });

// ─── Logo ───────────────────────────────────────────────────────────────────

export const getLogosFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  return getDb().select().from(logo).all();
});

export const createLogoFn = createServerFn({ method: "POST" })
  .inputValidator((d: FormData) => d)
  .handler(async ({ data }) => {
    await guard();
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("Missing file");
    const variant = String(data.get("variant") || "primary");
    const altText = String(data.get("altText") || "Gojo Solutions logo");
    const saved = await saveUpload(file, "logo", `logo-${variant}`);
    const db = getDb();

    // Only one active logo per variant (site reads active primary)
    if (variant === "primary") {
      for (const row of db.select().from(logo).all()) {
        if (row.variant === "primary" && row.isActive === 1) {
          db.update(logo).set({ isActive: 0 }).where(eq(logo.id, row.id)).run();
        }
      }
    }

    db.insert(logo)
      .values({
        variant,
        filePath: saved.path,
        altText,
        isActive: 1,
      })
      .run();
    return { ok: true as const, path: saved.path };
  });

export const updateLogoFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number; altText?: string; isActive?: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    const db = getDb();
    const { id, ...rest } = data;
    const row = db.select().from(logo).where(eq(logo.id, id)).get();
    if (!row) throw new Error("Logo not found");

    // Activating a primary logo deactivates other primary ones
    if (rest.isActive === 1 && row.variant === "primary") {
      for (const other of db.select().from(logo).all()) {
        if (other.variant === "primary" && other.id !== id && other.isActive === 1) {
          db.update(logo).set({ isActive: 0 }).where(eq(logo.id, other.id)).run();
        }
      }
    }

    db.update(logo).set(rest).where(eq(logo.id, id)).run();
    return { ok: true as const };
  });

export const deleteLogoFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    const row = getDb().select().from(logo).where(eq(logo.id, data.id)).get();
    if (row) deleteUploadByPublicPath(row.filePath);
    getDb().delete(logo).where(eq(logo.id, data.id)).run();
    return { ok: true as const };
  });

// ─── Home sections ──────────────────────────────────────────────────────────

export const getHomeSectionsFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  return getDb().select().from(homeSections).all();
});

export const updateHomeSectionFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      sectionKey: string;
      eyebrow?: string | null;
      heading?: string | null;
      body?: string | null;
      ctaLabel?: string | null;
      ctaHref?: string | null;
      cta2Label?: string | null;
      cta2Href?: string | null;
    }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    const { sectionKey, ...rest } = data;
    getDb()
      .update(homeSections)
      .set({ ...rest, updatedAt: now() })
      .where(eq(homeSections.sectionKey, sectionKey))
      .run();
    return { ok: true as const };
  });

// ─── About ──────────────────────────────────────────────────────────────────

export const getAboutHeaderFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  return getDb().select().from(aboutPageHeader).get() ?? null;
});

export const updateAboutHeaderFn = createServerFn({ method: "POST" })
  .inputValidator((d: { eyebrow: string; heading: string; body: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb()
      .update(aboutPageHeader)
      .set({ ...data, updatedAt: now() })
      .where(eq(aboutPageHeader.id, 1))
      .run();
    return { ok: true as const };
  });

export const getAboutBlocksFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  return getDb().select().from(aboutBlocks).orderBy(asc(aboutBlocks.sortOrder)).all();
});

export const createAboutBlockFn = createServerFn({ method: "POST" })
  .inputValidator((d: { label: string; body: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    const max = getDb().select().from(aboutBlocks).all().length;
    getDb()
      .insert(aboutBlocks)
      .values({ ...data, sortOrder: max, isVisible: 1 })
      .run();
    return { ok: true as const };
  });

export const updateAboutBlockFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { id: number; label: string; body: string; isVisible: number }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    const { id, ...rest } = data;
    getDb()
      .update(aboutBlocks)
      .set({ ...rest, updatedAt: now() })
      .where(eq(aboutBlocks.id, id))
      .run();
    return { ok: true as const };
  });

export const reorderAboutBlocksFn = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => d)
  .handler(async ({ data }) => {
    await guard();
    data.ids.forEach((id, i) => {
      getDb()
        .update(aboutBlocks)
        .set({ sortOrder: i, updatedAt: now() })
        .where(eq(aboutBlocks.id, id))
        .run();
    });
    return { ok: true as const };
  });

export const deleteAboutBlockFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb().delete(aboutBlocks).where(eq(aboutBlocks.id, data.id)).run();
    return { ok: true as const };
  });

// ─── Founders ───────────────────────────────────────────────────────────────

export const getFoundersFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  return getDb().select().from(founders).orderBy(asc(founders.sortOrder)).all();
});

export const createFounderFn = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; role: string; bio?: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    const max = getDb().select().from(founders).all().length;
    getDb()
      .insert(founders)
      .values({ name: data.name, role: data.role, bio: data.bio ?? null, sortOrder: max, isVisible: 1 })
      .run();
    return { ok: true as const };
  });

export const updateFounderFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { id: number; name: string; role: string; bio?: string | null; isVisible: number }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    const { id, ...rest } = data;
    getDb()
      .update(founders)
      .set({ ...rest, updatedAt: now() })
      .where(eq(founders.id, id))
      .run();
    return { ok: true as const };
  });

export const reorderFoundersFn = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => d)
  .handler(async ({ data }) => {
    await guard();
    data.ids.forEach((id, i) => {
      getDb()
        .update(founders)
        .set({ sortOrder: i, updatedAt: now() })
        .where(eq(founders.id, id))
        .run();
    });
    return { ok: true as const };
  });

export const deleteFounderFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    const row = getDb().select().from(founders).where(eq(founders.id, data.id)).get();
    if (row?.photoPath) deleteUploadByPublicPath(row.photoPath);
    getDb().delete(founders).where(eq(founders.id, data.id)).run();
    return { ok: true as const };
  });

export const uploadFounderPhotoFn = createServerFn({ method: "POST" })
  .inputValidator((d: FormData) => d)
  .handler(async ({ data }) => {
    await guard();
    const id = Number(data.get("id"));
    const file = data.get("file");
    if (!(file instanceof File) || !id) throw new Error("Missing file or id");
    const row = getDb().select().from(founders).where(eq(founders.id, id)).get();
    if (!row) throw new Error("Founder not found");
    if (row.photoPath) deleteUploadByPublicPath(row.photoPath);
    const saved = await saveUpload(file, "founders", "founder");
    getDb()
      .update(founders)
      .set({ photoPath: saved.path, updatedAt: now() })
      .where(eq(founders.id, id))
      .run();
    return { ok: true as const, path: saved.path };
  });

export const deleteFounderPhotoFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    const row = getDb().select().from(founders).where(eq(founders.id, data.id)).get();
    if (row?.photoPath) deleteUploadByPublicPath(row.photoPath);
    getDb()
      .update(founders)
      .set({ photoPath: null, updatedAt: now() })
      .where(eq(founders.id, data.id))
      .run();
    return { ok: true as const };
  });

// ─── Capabilities ───────────────────────────────────────────────────────────

export const getCapabilitiesAdminFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = getDb();
  const caps = db.select().from(capabilities).orderBy(asc(capabilities.sortOrder)).all();
  return caps.map((c) => ({
    ...c,
    functions: db
      .select()
      .from(capabilityFunctions)
      .where(eq(capabilityFunctions.capabilityId, c.id))
      .orderBy(asc(capabilityFunctions.sortOrder))
      .all(),
  }));
});

export const getCapabilityAdminFn = createServerFn({ method: "GET" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    const db = getDb();
    const c = db.select().from(capabilities).where(eq(capabilities.id, data.id)).get();
    if (!c) return null;
    const functions = db
      .select()
      .from(capabilityFunctions)
      .where(eq(capabilityFunctions.capabilityId, c.id))
      .orderBy(asc(capabilityFunctions.sortOrder))
      .all();
    return { ...c, functions };
  });

export const createCapabilityFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      slug: string;
      title: string;
      shortDesc: string;
      strategicPurpose: string;
      body?: string;
      pageEyebrow?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    const max = getDb().select().from(capabilities).all().length;
    const slug = data.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    getDb()
      .insert(capabilities)
      .values({
        slug,
        title: data.title,
        shortDesc: data.shortDesc,
        strategicPurpose: data.strategicPurpose,
        body: data.body ?? data.strategicPurpose,
        pageEyebrow: data.pageEyebrow ?? "Capability",
        sortOrder: max,
        isVisible: 1,
      })
      .run();
    return { ok: true as const };
  });

export const updateCapabilityFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      id: number;
      title: string;
      shortDesc: string;
      strategicPurpose: string;
      body?: string | null;
      pageEyebrow?: string | null;
      heroImagePath?: string | null;
      cardImagePath?: string | null;
      metaTitle?: string | null;
      metaDescription?: string | null;
      isVisible: number;
    }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    const { id, ...rest } = data;
    getDb()
      .update(capabilities)
      .set({ ...rest, updatedAt: now() })
      .where(eq(capabilities.id, id))
      .run();
    return { ok: true as const };
  });

export const uploadCapabilityImageFn = createServerFn({ method: "POST" })
  .inputValidator((d: FormData) => d)
  .handler(async ({ data }) => {
    await guard();
    const id = Number(data.get("id"));
    const slot = String(data.get("slot") || "hero") as "hero" | "card";
    const file = data.get("file");
    if (!(file instanceof File) || !id) throw new Error("Missing file or id");
    const row = getDb().select().from(capabilities).where(eq(capabilities.id, id)).get();
    if (!row) throw new Error("Capability not found");
    const prev = slot === "card" ? row.cardImagePath : row.heroImagePath;
    if (prev) deleteUploadByPublicPath(prev);
    const saved = await saveUpload(file, "capabilities", `cap-${slot}`);
    getDb()
      .update(capabilities)
      .set(
        slot === "card"
          ? { cardImagePath: saved.path, updatedAt: now() }
          : { heroImagePath: saved.path, updatedAt: now() },
      )
      .where(eq(capabilities.id, id))
      .run();
    return { ok: true as const, path: saved.path, slot };
  });

export const deleteCapabilityImageFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number; slot: "hero" | "card" }) => d)
  .handler(async ({ data }) => {
    await guard();
    const row = getDb().select().from(capabilities).where(eq(capabilities.id, data.id)).get();
    if (!row) throw new Error("Not found");
    const prev = data.slot === "card" ? row.cardImagePath : row.heroImagePath;
    if (prev) deleteUploadByPublicPath(prev);
    getDb()
      .update(capabilities)
      .set(
        data.slot === "card"
          ? { cardImagePath: null, updatedAt: now() }
          : { heroImagePath: null, updatedAt: now() },
      )
      .where(eq(capabilities.id, data.id))
      .run();
    return { ok: true as const };
  });

export const reorderCapabilitiesFn = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => d)
  .handler(async ({ data }) => {
    await guard();
    data.ids.forEach((id, i) => {
      getDb()
        .update(capabilities)
        .set({ sortOrder: i, updatedAt: now() })
        .where(eq(capabilities.id, id))
        .run();
    });
    return { ok: true as const };
  });

export const deleteCapabilityFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    const row = getDb().select().from(capabilities).where(eq(capabilities.id, data.id)).get();
    if (row?.heroImagePath) deleteUploadByPublicPath(row.heroImagePath);
    if (row?.cardImagePath) deleteUploadByPublicPath(row.cardImagePath);
    getDb().delete(capabilities).where(eq(capabilities.id, data.id)).run();
    return { ok: true as const };
  });

export const createCapabilityFunctionFn = createServerFn({ method: "POST" })
  .inputValidator((d: { capabilityId: number; label: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    const max = getDb()
      .select()
      .from(capabilityFunctions)
      .where(eq(capabilityFunctions.capabilityId, data.capabilityId))
      .all().length;
    getDb()
      .insert(capabilityFunctions)
      .values({ capabilityId: data.capabilityId, label: data.label, sortOrder: max })
      .run();
    return { ok: true as const };
  });

export const updateCapabilityFunctionFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number; label: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb()
      .update(capabilityFunctions)
      .set({ label: data.label })
      .where(eq(capabilityFunctions.id, data.id))
      .run();
    return { ok: true as const };
  });

export const reorderCapabilityFunctionsFn = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => d)
  .handler(async ({ data }) => {
    await guard();
    data.ids.forEach((id, i) => {
      getDb()
        .update(capabilityFunctions)
        .set({ sortOrder: i })
        .where(eq(capabilityFunctions.id, id))
        .run();
    });
    return { ok: true as const };
  });

export const deleteCapabilityFunctionFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb().delete(capabilityFunctions).where(eq(capabilityFunctions.id, data.id)).run();
    return { ok: true as const };
  });

// ─── Promise / Audiences ────────────────────────────────────────────────────

export const getPromiseFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  return getDb().select().from(promiseItems).orderBy(asc(promiseItems.sortOrder)).all();
});

export const createPromiseFn = createServerFn({ method: "POST" })
  .inputValidator((d: { title: string; body: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    const max = getDb().select().from(promiseItems).all().length;
    getDb()
      .insert(promiseItems)
      .values({ ...data, sortOrder: max, isVisible: 1 })
      .run();
    return { ok: true as const };
  });

export const updatePromiseFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { id: number; title: string; body: string; isVisible: number }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    const { id, ...rest } = data;
    getDb()
      .update(promiseItems)
      .set({ ...rest, updatedAt: now() })
      .where(eq(promiseItems.id, id))
      .run();
    return { ok: true as const };
  });

export const reorderPromiseFn = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => d)
  .handler(async ({ data }) => {
    await guard();
    data.ids.forEach((id, i) => {
      getDb()
        .update(promiseItems)
        .set({ sortOrder: i, updatedAt: now() })
        .where(eq(promiseItems.id, id))
        .run();
    });
    return { ok: true as const };
  });

export const deletePromiseFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb().delete(promiseItems).where(eq(promiseItems.id, data.id)).run();
    return { ok: true as const };
  });

export const getAudiencesFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  return getDb().select().from(audiences).orderBy(asc(audiences.sortOrder)).all();
});

export const createAudienceFn = createServerFn({ method: "POST" })
  .inputValidator((d: { label: string; body: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    const max = getDb().select().from(audiences).all().length;
    getDb()
      .insert(audiences)
      .values({ ...data, sortOrder: max, isVisible: 1 })
      .run();
    return { ok: true as const };
  });

export const updateAudienceFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { id: number; label: string; body: string; isVisible: number }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    const { id, ...rest } = data;
    getDb()
      .update(audiences)
      .set({ ...rest, updatedAt: now() })
      .where(eq(audiences.id, id))
      .run();
    return { ok: true as const };
  });

export const reorderAudiencesFn = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => d)
  .handler(async ({ data }) => {
    await guard();
    data.ids.forEach((id, i) => {
      getDb()
        .update(audiences)
        .set({ sortOrder: i, updatedAt: now() })
        .where(eq(audiences.id, id))
        .run();
    });
    return { ok: true as const };
  });

export const deleteAudienceFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb().delete(audiences).where(eq(audiences.id, data.id)).run();
    return { ok: true as const };
  });

// ─── Gojo Shop ──────────────────────────────────────────────────────────────

export const getGojoShopAdminFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = getDb();
  return {
    page: db.select().from(gojoShopPage).get() ?? null,
    workflows: db
      .select()
      .from(gojoShopWorkflowImages)
      .orderBy(asc(gojoShopWorkflowImages.sortOrder))
      .all(),
  };
});

export const updateGojoShopFn = createServerFn({ method: "POST" })
  .inputValidator((d: Record<string, string>) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb()
      .update(gojoShopPage)
      .set({ ...data, updatedAt: now() } as typeof gojoShopPage.$inferInsert)
      .where(eq(gojoShopPage.id, 1))
      .run();
    return { ok: true as const };
  });

export const createWorkflowFn = createServerFn({ method: "POST" })
  .inputValidator((d: { title: string; body: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    const max = getDb().select().from(gojoShopWorkflowImages).all().length;
    getDb()
      .insert(gojoShopWorkflowImages)
      .values({ ...data, sortOrder: max, isVisible: 1 })
      .run();
    return { ok: true as const };
  });

export const updateWorkflowFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { id: number; title: string; body: string; isVisible: number }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    const { id, ...rest } = data;
    getDb()
      .update(gojoShopWorkflowImages)
      .set({ ...rest, updatedAt: now() })
      .where(eq(gojoShopWorkflowImages.id, id))
      .run();
    return { ok: true as const };
  });

export const uploadWorkflowImageFn = createServerFn({ method: "POST" })
  .inputValidator((d: FormData) => d)
  .handler(async ({ data }) => {
    await guard();
    const id = Number(data.get("id"));
    const file = data.get("file");
    if (!(file instanceof File) || !id) throw new Error("Missing file or id");
    const row = getDb()
      .select()
      .from(gojoShopWorkflowImages)
      .where(eq(gojoShopWorkflowImages.id, id))
      .get();
    if (!row) throw new Error("Not found");
    if (row.imagePath) deleteUploadByPublicPath(row.imagePath);
    const saved = await saveUpload(file, "gojo-shop", "gojoshop");
    getDb()
      .update(gojoShopWorkflowImages)
      .set({ imagePath: saved.path, updatedAt: now() })
      .where(eq(gojoShopWorkflowImages.id, id))
      .run();
    return { ok: true as const, path: saved.path };
  });

export const reorderWorkflowFn = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => d)
  .handler(async ({ data }) => {
    await guard();
    data.ids.forEach((id, i) => {
      getDb()
        .update(gojoShopWorkflowImages)
        .set({ sortOrder: i, updatedAt: now() })
        .where(eq(gojoShopWorkflowImages.id, id))
        .run();
    });
    return { ok: true as const };
  });

export const deleteWorkflowFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    const row = getDb()
      .select()
      .from(gojoShopWorkflowImages)
      .where(eq(gojoShopWorkflowImages.id, data.id))
      .get();
    if (row?.imagePath) deleteUploadByPublicPath(row.imagePath);
    getDb().delete(gojoShopWorkflowImages).where(eq(gojoShopWorkflowImages.id, data.id)).run();
    return { ok: true as const };
  });

// ─── What we do header ──────────────────────────────────────────────────────

export const getWhatWeDoHeaderFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  return getDb().select().from(whatWeDoPageHeader).get() ?? null;
});

export const updateWhatWeDoHeaderFn = createServerFn({ method: "POST" })
  .inputValidator((d: { eyebrow: string; heading: string; body: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb()
      .update(whatWeDoPageHeader)
      .set({ ...data, updatedAt: now() })
      .where(eq(whatWeDoPageHeader.id, 1))
      .run();
    return { ok: true as const };
  });

// ─── Partnerships ───────────────────────────────────────────────────────────

export const getPartnershipsAdminFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = getDb();
  return {
    page: db.select().from(partnershipsPage).get() ?? null,
    vendorProps: db
      .select()
      .from(vendorValueProps)
      .orderBy(asc(vendorValueProps.sortOrder))
      .all(),
    standards: db
      .select()
      .from(partnershipStandards)
      .orderBy(asc(partnershipStandards.sortOrder))
      .all(),
    partners: db.select().from(partnerTypes).orderBy(asc(partnerTypes.sortOrder)).all(),
  };
});

export const updatePartnershipsPageFn = createServerFn({ method: "POST" })
  .inputValidator((d: Record<string, string | null>) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb()
      .update(partnershipsPage)
      .set({ ...data, updatedAt: now() } as typeof partnershipsPage.$inferInsert)
      .where(eq(partnershipsPage.id, 1))
      .run();
    return { ok: true as const };
  });

export const createVendorPropFn = createServerFn({ method: "POST" })
  .inputValidator((d: { title: string; body: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    const max = getDb().select().from(vendorValueProps).all().length;
    getDb()
      .insert(vendorValueProps)
      .values({ ...data, sortOrder: max, isVisible: 1 })
      .run();
    return { ok: true as const };
  });

export const updateVendorPropFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { id: number; title: string; body: string; isVisible: number }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    const { id, ...rest } = data;
    getDb()
      .update(vendorValueProps)
      .set({ ...rest, updatedAt: now() })
      .where(eq(vendorValueProps.id, id))
      .run();
    return { ok: true as const };
  });

export const reorderVendorPropsFn = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => d)
  .handler(async ({ data }) => {
    await guard();
    data.ids.forEach((id, i) => {
      getDb()
        .update(vendorValueProps)
        .set({ sortOrder: i, updatedAt: now() })
        .where(eq(vendorValueProps.id, id))
        .run();
    });
    return { ok: true as const };
  });

export const deleteVendorPropFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb().delete(vendorValueProps).where(eq(vendorValueProps.id, data.id)).run();
    return { ok: true as const };
  });

export const createStandardFn = createServerFn({ method: "POST" })
  .inputValidator((d: { label: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    const max = getDb().select().from(partnershipStandards).all().length;
    getDb()
      .insert(partnershipStandards)
      .values({ label: data.label, sortOrder: max, isVisible: 1 })
      .run();
    return { ok: true as const };
  });

export const updateStandardFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number; label: string; isVisible: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    const { id, ...rest } = data;
    getDb()
      .update(partnershipStandards)
      .set(rest)
      .where(eq(partnershipStandards.id, id))
      .run();
    return { ok: true as const };
  });

export const reorderStandardsFn = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => d)
  .handler(async ({ data }) => {
    await guard();
    data.ids.forEach((id, i) => {
      getDb()
        .update(partnershipStandards)
        .set({ sortOrder: i })
        .where(eq(partnershipStandards.id, id))
        .run();
    });
    return { ok: true as const };
  });

export const deleteStandardFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb().delete(partnershipStandards).where(eq(partnershipStandards.id, data.id)).run();
    return { ok: true as const };
  });

export const createPartnerTypeFn = createServerFn({ method: "POST" })
  .inputValidator((d: { title: string; body: string; example?: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    const max = getDb().select().from(partnerTypes).all().length;
    getDb()
      .insert(partnerTypes)
      .values({
        title: data.title,
        body: data.body,
        example: data.example ?? null,
        sortOrder: max,
        isVisible: 1,
      })
      .run();
    return { ok: true as const };
  });

export const updatePartnerTypeFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      id: number;
      title: string;
      body: string;
      example?: string | null;
      isVisible: number;
    }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    const { id, ...rest } = data;
    getDb()
      .update(partnerTypes)
      .set({ ...rest, updatedAt: now() })
      .where(eq(partnerTypes.id, id))
      .run();
    return { ok: true as const };
  });

export const uploadPartnerLogoFn = createServerFn({ method: "POST" })
  .inputValidator((d: FormData) => d)
  .handler(async ({ data }) => {
    await guard();
    const id = Number(data.get("id"));
    const file = data.get("file");
    if (!(file instanceof File) || !id) throw new Error("Missing file or id");
    const row = getDb().select().from(partnerTypes).where(eq(partnerTypes.id, id)).get();
    if (!row) throw new Error("Not found");
    if (row.logoPath) deleteUploadByPublicPath(row.logoPath);
    const saved = await saveUpload(file, "partners", "partner");
    getDb()
      .update(partnerTypes)
      .set({ logoPath: saved.path, updatedAt: now() })
      .where(eq(partnerTypes.id, id))
      .run();
    return { ok: true as const, path: saved.path };
  });

export const reorderPartnerTypesFn = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => d)
  .handler(async ({ data }) => {
    await guard();
    data.ids.forEach((id, i) => {
      getDb()
        .update(partnerTypes)
        .set({ sortOrder: i, updatedAt: now() })
        .where(eq(partnerTypes.id, id))
        .run();
    });
    return { ok: true as const };
  });

export const deletePartnerTypeFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    const row = getDb().select().from(partnerTypes).where(eq(partnerTypes.id, data.id)).get();
    if (row?.logoPath) deleteUploadByPublicPath(row.logoPath);
    getDb().delete(partnerTypes).where(eq(partnerTypes.id, data.id)).run();
    return { ok: true as const };
  });

// ─── Contact ────────────────────────────────────────────────────────────────

export const getContactAdminFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = getDb();
  return {
    page: db.select().from(contactPage).get() ?? null,
    interests: db
      .select()
      .from(contactInterestOptions)
      .orderBy(asc(contactInterestOptions.sortOrder))
      .all(),
  };
});

export const updateContactPageFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      headerEyebrow: string;
      headerHeading: string;
      headerBody: string;
      headOfficeLabel: string;
      emailLabel: string;
      phoneLabel: string;
      phoneNumber: string | null;
      showPhone: number;
      platformLabel: string;
      formNote: string | null;
    }) => d,
  )
  .handler(async ({ data }) => {
    await guard();
    getDb()
      .update(contactPage)
      .set({ ...data, updatedAt: now() })
      .where(eq(contactPage.id, 1))
      .run();
    return { ok: true as const };
  });

export const createInterestFn = createServerFn({ method: "POST" })
  .inputValidator((d: { label: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    const max = getDb().select().from(contactInterestOptions).all().length;
    getDb()
      .insert(contactInterestOptions)
      .values({ label: data.label, sortOrder: max, isVisible: 1 })
      .run();
    return { ok: true as const };
  });

export const updateInterestFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number; label: string; isVisible: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    const { id, ...rest } = data;
    getDb()
      .update(contactInterestOptions)
      .set(rest)
      .where(eq(contactInterestOptions.id, id))
      .run();
    return { ok: true as const };
  });

export const reorderInterestsFn = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => d)
  .handler(async ({ data }) => {
    await guard();
    data.ids.forEach((id, i) => {
      getDb()
        .update(contactInterestOptions)
        .set({ sortOrder: i })
        .where(eq(contactInterestOptions.id, id))
        .run();
    });
    return { ok: true as const };
  });

export const deleteInterestFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb().delete(contactInterestOptions).where(eq(contactInterestOptions.id, data.id)).run();
    return { ok: true as const };
  });

// ─── Media ──────────────────────────────────────────────────────────────────

export const listMediaFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  return listMediaLibrary();
});

export const uploadMediaFn = createServerFn({ method: "POST" })
  .inputValidator((d: FormData) => d)
  .handler(async ({ data }) => {
    await guard();
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("Missing file");
    const category = (String(data.get("category") || "general") as UploadCategory);
    const saved = await saveUpload(file, category);
    return { ok: true as const, path: saved.path };
  });

export const deleteMediaFn = createServerFn({ method: "POST" })
  .inputValidator((d: { path: string }) => d)
  .handler(async ({ data }) => {
    await guard();
    if (!isSafeUploadPath(data.path)) throw new Error("Invalid path");
    deleteUploadByPublicPath(data.path);
    return { ok: true as const };
  });

// ─── Messages / notifications ───────────────────────────────────────────────

type MessageRow = typeof contactMessages.$inferSelect;

function applyMessageFilters(
  rows: MessageRow[],
  filter: ReturnType<typeof normalizeMessageListFilter>,
) {
  return rows.filter((m) => {
    if (filter.source !== "all" && m.source !== filter.source) return false;
    if (filter.status === "read" && m.isRead !== 1) return false;
    if (filter.status === "unread" && m.isRead !== 0) return false;
    if (filter.interest && m.interest !== filter.interest) return false;
    if (filter.from) {
      const start = `${filter.from}T00:00:00.000Z`;
      if (m.createdAt < start) return false;
    }
    if (filter.to) {
      const end = `${filter.to}T23:59:59.999Z`;
      if (m.createdAt > end) return false;
    }
    return true;
  });
}

export const getUnreadMessageCountFn = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  return getDb()
    .select()
    .from(contactMessages)
    .all()
    .filter((m) => m.isRead === 0).length;
});

export const getContactMessagesFn = createServerFn({ method: "GET" })
  .inputValidator((d: MessageListFilter = {}) => normalizeMessageListFilter(d))
  .handler(async ({ data: filter }) => {
    await guard();
    const all = getDb()
      .select()
      .from(contactMessages)
      .all()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    const filtered = applyMessageFilters(all, filter);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / filter.pageSize));
    const page = Math.min(filter.page, totalPages);
    const start = (page - 1) * filter.pageSize;
    const items = filtered.slice(start, start + filter.pageSize);

    const interests = [...new Set(all.map((m) => m.interest))].sort();
    const unreadTotal = all.filter((m) => m.isRead === 0).length;
    const matchUnread = filtered.filter((m) => m.isRead === 0).length;

    return {
      items,
      total,
      page,
      pageSize: filter.pageSize,
      totalPages,
      filter,
      interests,
      unreadTotal,
      matchCount: total,
      matchUnread,
    };
  });

export const getContactMessageFn = createServerFn({ method: "GET" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    return getDb().select().from(contactMessages).where(eq(contactMessages.id, data.id)).get() ?? null;
  });

export const markMessageReadFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number; isRead: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb()
      .update(contactMessages)
      .set({ isRead: data.isRead ? 1 : 0 })
      .where(eq(contactMessages.id, data.id))
      .run();
    return { ok: true as const };
  });

export const deleteContactMessageFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await guard();
    getDb().delete(contactMessages).where(eq(contactMessages.id, data.id)).run();
    return { ok: true as const };
  });

/** Delete all messages matching the given filters (date, source, read status, interest). */
export const clearContactMessagesFn = createServerFn({ method: "POST" })
  .inputValidator((d: MessageListFilter = {}) => normalizeMessageListFilter(d))
  .handler(async ({ data: filter }) => {
    await guard();
    const db = getDb();
    const all = db.select().from(contactMessages).all();
    const matched = applyMessageFilters(all, filter);
    for (const m of matched) {
      db.delete(contactMessages).where(eq(contactMessages.id, m.id)).run();
    }
    return { ok: true as const, deleted: matched.length };
  });
