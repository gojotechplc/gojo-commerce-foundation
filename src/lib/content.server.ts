import { asc, eq } from "drizzle-orm";
import { ensureSeeded, getDb } from "./db.server";
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
} from "../../db/schema";
import type { SiteChromeData } from "./site-types";
import {
  audiences as fallbackAudiences,
  capabilities as fallbackCapabilities,
  company as fallbackCompany,
  promise as fallbackPromise,
} from "./content";

export type { SiteChromeData };

function sectionMap(rows: { sectionKey: string }[]) {
  return Object.fromEntries(rows.map((r) => [r.sectionKey, r]));
}

export async function loadSiteChrome(): Promise<SiteChromeData> {
  try {
    await ensureSeeded();
    const db = getDb();
    const company = db.select().from(companyInfo).get();
    const logos = db.select().from(logo).where(eq(logo.isActive, 1)).all();
    const activeLogo =
      logos.find((l) => l.variant === "primary") ?? logos[0] ?? null;
    const nav = db
      .select()
      .from(navLinks)
      .where(eq(navLinks.isVisible, 1))
      .orderBy(asc(navLinks.sortOrder))
      .all();
    const footer = db
      .select()
      .from(footerLinks)
      .where(eq(footerLinks.isVisible, 1))
      .orderBy(asc(footerLinks.sortOrder))
      .all();
    const navCta = db
      .select()
      .from(homeSections)
      .where(eq(homeSections.sectionKey, "nav_cta"))
      .get();

    if (!company) throw new Error("missing company");

    return {
      company: {
        name: company.name,
        shortName: company.shortName,
        tagline: company.tagline,
        positioning: company.positioning,
        location: company.location,
        shopUrl: company.shopUrl,
        contactEmail: company.contactEmail,
      },
      logo: activeLogo
        ? {
            filePath: `${activeLogo.filePath}?v=${encodeURIComponent(activeLogo.uploadedAt)}`,
            altText: activeLogo.altText,
          }
        : null,
      nav: nav.map((n) => ({ label: n.label, href: n.href })),
      footer: footer.map((n) => ({ label: n.label, href: n.href })),
      navCtaLabel: navCta?.ctaLabel ?? "Visit Gojo Shop →",
      navCtaHref: navCta?.ctaHref ?? company.shopUrl,
    };
  } catch {
    return {
      company: {
        name: fallbackCompany.name,
        shortName: fallbackCompany.shortName,
        tagline: fallbackCompany.tagline,
        positioning: fallbackCompany.positioning,
        location: fallbackCompany.location,
        shopUrl: fallbackCompany.shopUrl,
        contactEmail: fallbackCompany.contactEmail,
      },
      logo: null,
      nav: [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "What We Do", href: "/what-we-do" },
        { label: "Gojo Shop", href: "/gojo-shop" },
        { label: "Partnerships", href: "/partnerships" },
        { label: "Contact", href: "/contact" },
      ],
      footer: [
        { label: "About", href: "/about" },
        { label: "What We Do", href: "/what-we-do" },
        { label: "Gojo Shop", href: "/gojo-shop" },
        { label: "Partnerships", href: "/partnerships" },
        { label: "Contact", href: "/contact" },
      ],
      navCtaLabel: "Visit Gojo Shop →",
      navCtaHref: fallbackCompany.shopUrl,
    };
  }
}

export async function loadGlobalMeta() {
  try {
    await ensureSeeded();
    const meta = getDb().select().from(globalMeta).get();
    if (!meta) throw new Error("missing meta");
    return meta;
  } catch {
    const title =
      "Gojo Solutions PLC — Trust-driven commerce infrastructure in Ethiopia";
    const description =
      "Gojo Solutions PLC builds the infrastructure, systems, and partnerships that make commerce more reliable, efficient, and accessible in Ethiopia. Parent of Gojo Shop.";
    return {
      id: 1,
      siteTitle: title,
      siteDescription: description,
      author: "Gojo Solutions PLC",
      ogSiteName: "Gojo Solutions PLC",
      ogTitle: title,
      ogDescription: description,
      ogType: "website",
      ogImagePath: null as string | null,
      twitterCard: "summary_large_image",
      twitterTitle: title,
      twitterDescription: description,
      twitterImagePath: null as string | null,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function loadPageMeta(pageKey: string) {
  try {
    await ensureSeeded();
    return getDb().select().from(pageMeta).where(eq(pageMeta.pageKey, pageKey)).get() ?? null;
  } catch {
    return null;
  }
}

export async function loadCapabilities() {
  try {
    await ensureSeeded();
    const db = getDb();
    const caps = db
      .select()
      .from(capabilities)
      .where(eq(capabilities.isVisible, 1))
      .orderBy(asc(capabilities.sortOrder))
      .all();
    return caps.map((c) => {
      const fns = db
        .select()
        .from(capabilityFunctions)
        .where(eq(capabilityFunctions.capabilityId, c.id))
        .orderBy(asc(capabilityFunctions.sortOrder))
        .all();
      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        short: c.shortDesc,
        strategicPurpose: c.strategicPurpose,
        body: c.body,
        pageEyebrow: c.pageEyebrow,
        heroImagePath: c.heroImagePath,
        cardImagePath: c.cardImagePath,
        metaTitle: c.metaTitle,
        metaDescription: c.metaDescription,
        keyFunctions: fns.map((f) => f.label),
      };
    });
  } catch {
    return fallbackCapabilities.map((c) => ({
      ...c,
      id: 0,
      body: null as string | null,
      pageEyebrow: null as string | null,
      heroImagePath: null as string | null,
      cardImagePath: null as string | null,
      metaTitle: null as string | null,
      metaDescription: null as string | null,
    }));
  }
}

export async function loadCapabilityBySlug(slug: string) {
  await ensureSeeded();
  const db = getDb();
  const c = db
    .select()
    .from(capabilities)
    .where(eq(capabilities.slug, slug))
    .get();
  if (!c || c.isVisible !== 1) return null;
  const fns = db
    .select()
    .from(capabilityFunctions)
    .where(eq(capabilityFunctions.capabilityId, c.id))
    .orderBy(asc(capabilityFunctions.sortOrder))
    .all();
  const chrome = await loadSiteChrome();
  const all = await loadCapabilities();
  return {
    chrome,
    capability: {
      ...c,
      keyFunctions: fns.map((f) => f.label),
    },
    siblings: all.map((x) => ({ slug: x.slug, title: x.title })),
  };
}

export async function loadHomePage() {
  try {
    await ensureSeeded();
    const db = getDb();
    const chrome = await loadSiteChrome();
    const sections = sectionMap(db.select().from(homeSections).all());
    const promise = db
      .select()
      .from(promiseItems)
      .where(eq(promiseItems.isVisible, 1))
      .orderBy(asc(promiseItems.sortOrder))
      .all();
    const audienceRows = db
      .select()
      .from(audiences)
      .where(eq(audiences.isVisible, 1))
      .orderBy(asc(audiences.sortOrder))
      .all();
    const caps = await loadCapabilities();
    const foundersRows = db
      .select()
      .from(founders)
      .where(eq(founders.isVisible, 1))
      .orderBy(asc(founders.sortOrder))
      .all();
    const meta = await loadPageMeta("home");

    return {
      chrome,
      sections,
      promise,
      audiences: audienceRows,
      capabilities: caps,
      founders: foundersRows,
      meta,
    };
  } catch {
    const chrome = await loadSiteChrome();
    return {
      chrome,
      sections: {} as Record<string, never>,
      promise: fallbackPromise.map((p, i) => ({
        id: i,
        title: p.title,
        body: p.body,
        sortOrder: i,
        isVisible: 1,
        updatedAt: "",
      })),
      audiences: fallbackAudiences.map((a, i) => ({
        id: i,
        label: a.label,
        body: a.body,
        sortOrder: i,
        isVisible: 1,
        updatedAt: "",
      })),
      capabilities: fallbackCapabilities.map((c) => ({ ...c, id: 0 })),
      founders: fallbackCompany.founders.map((f, i) => ({
        id: i,
        name: f.name,
        role: f.role,
        bio: null as string | null,
        photoPath: null as string | null,
        sortOrder: i,
        isVisible: 1,
        updatedAt: "",
      })),
      meta: null,
    };
  }
}

export async function loadAboutPage() {
  await ensureSeeded();
  const db = getDb();
  const chrome = await loadSiteChrome();
  const header = db.select().from(aboutPageHeader).get();
  const blocks = db
    .select()
    .from(aboutBlocks)
    .where(eq(aboutBlocks.isVisible, 1))
    .orderBy(asc(aboutBlocks.sortOrder))
    .all();
  const foundersRows = db
    .select()
    .from(founders)
    .where(eq(founders.isVisible, 1))
    .orderBy(asc(founders.sortOrder))
    .all();
  const foundersHeader = db
    .select()
    .from(homeSections)
    .where(eq(homeSections.sectionKey, "about_founders_header"))
    .get();
  const meta = await loadPageMeta("about");
  return { chrome, header, blocks, founders: foundersRows, foundersHeader, meta };
}

export async function loadWhatWeDoPage() {
  await ensureSeeded();
  const chrome = await loadSiteChrome();
  const header = getDb().select().from(whatWeDoPageHeader).get();
  const caps = await loadCapabilities();
  const meta = await loadPageMeta("what-we-do");
  return { chrome, header, capabilities: caps, meta };
}

export async function loadGojoShopPage() {
  await ensureSeeded();
  const db = getDb();
  const chrome = await loadSiteChrome();
  const page = db.select().from(gojoShopPage).get();
  const workflows = db
    .select()
    .from(gojoShopWorkflowImages)
    .where(eq(gojoShopWorkflowImages.isVisible, 1))
    .orderBy(asc(gojoShopWorkflowImages.sortOrder))
    .all();
  const promise = db
    .select()
    .from(promiseItems)
    .where(eq(promiseItems.isVisible, 1))
    .orderBy(asc(promiseItems.sortOrder))
    .all();
  const meta = await loadPageMeta("gojo-shop");
  return { chrome, page, workflows, promise, meta };
}

export async function loadPartnershipsPage() {
  await ensureSeeded();
  const db = getDb();
  const chrome = await loadSiteChrome();
  const page = db.select().from(partnershipsPage).get();
  const vendorProps = db
    .select()
    .from(vendorValueProps)
    .where(eq(vendorValueProps.isVisible, 1))
    .orderBy(asc(vendorValueProps.sortOrder))
    .all();
  const standards = db
    .select()
    .from(partnershipStandards)
    .where(eq(partnershipStandards.isVisible, 1))
    .orderBy(asc(partnershipStandards.sortOrder))
    .all();
  const partners = db
    .select()
    .from(partnerTypes)
    .where(eq(partnerTypes.isVisible, 1))
    .orderBy(asc(partnerTypes.sortOrder))
    .all();
  const meta = await loadPageMeta("partnerships");
  return { chrome, page, vendorProps, standards, partners, meta };
}

export async function loadContactPage() {
  await ensureSeeded();
  const db = getDb();
  const chrome = await loadSiteChrome();
  const page = db.select().from(contactPage).get();
  const interests = db
    .select()
    .from(contactInterestOptions)
    .where(eq(contactInterestOptions.isVisible, 1))
    .orderBy(asc(contactInterestOptions.sortOrder))
    .all();
  const meta = await loadPageMeta("contact");
  return { chrome, page, interests, meta };
}
