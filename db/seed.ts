import { getDb, getSqlite } from "./client";
import {
  adminUsers,
  companyInfo,
  globalMeta,
  navLinks,
  footerLinks,
  promiseItems,
  audiences,
  capabilities,
  capabilityFunctions,
  aboutBlocks,
  founders,
  homeSections,
  pageMeta,
  gojoShopPage,
  gojoShopWorkflowImages,
  partnershipsPage,
  vendorValueProps,
  partnershipStandards,
  partnerTypes,
  contactPage,
  contactInterestOptions,
  aboutPageHeader,
  whatWeDoPageHeader,
} from "./schema";
import {
  company,
  promise,
  audiences as audiencesSeed,
  capabilities as capabilitiesSeed,
} from "../src/lib/content";

const DEFAULT_OG =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ecfaf43d-0d3e-4d93-8b3c-81e3aa7bc7d9/id-preview-61d13a51--86bb7f8b-862e-4d6e-a0b1-be77dbac8625.lovable.app-1784269312089.png";

export async function runSeed(opts: { force?: boolean } = {}) {
  const db = getDb();
  const sqlite = getSqlite();

  if (opts.force) {
    sqlite.exec(`
      DELETE FROM capability_functions;
      DELETE FROM capabilities;
      DELETE FROM sessions;
      DELETE FROM admin_users;
      DELETE FROM company_info;
      DELETE FROM logo;
      DELETE FROM global_meta;
      DELETE FROM nav_links;
      DELETE FROM footer_links;
      DELETE FROM promise_items;
      DELETE FROM audiences;
      DELETE FROM about_blocks;
      DELETE FROM founders;
      DELETE FROM home_sections;
      DELETE FROM page_meta;
      DELETE FROM gojo_shop_page;
      DELETE FROM gojo_shop_workflow_images;
      DELETE FROM partnerships_page;
      DELETE FROM vendor_value_props;
      DELETE FROM partnership_standards;
      DELETE FROM partner_types;
      DELETE FROM contact_page;
      DELETE FROM contact_interest_options;
      DELETE FROM about_page_header;
      DELETE FROM what_we_do_page_header;
    `);
  }

  const existing = db.select().from(companyInfo).get();
  if (existing && !opts.force) {
    console.log("Database already seeded — skipping. Use --force to reseed.");
    return;
  }

  const { hashPassword } = await import("../src/lib/password.server");
  const passwordHash = await hashPassword("ChangeMe123!");

  db.insert(adminUsers)
    .values({
      username: "admin",
      passwordHash,
      forcePasswordChange: 1,
    })
    .run();

  db.insert(companyInfo)
    .values({
      id: 1,
      name: company.name,
      shortName: company.shortName,
      tagline: company.tagline,
      positioning: company.positioning,
      location: company.location,
      shopUrl: company.shopUrl,
      contactEmail: company.contactEmail,
    })
    .run();

  const siteTitle = "Gojo Solutions PLC — Trust-driven commerce infrastructure in Ethiopia";
  const siteDescription =
    "Gojo Solutions PLC builds the infrastructure, systems, and partnerships that make commerce more reliable, efficient, and accessible in Ethiopia. Parent of Gojo Shop.";

  db.insert(globalMeta)
    .values({
      id: 1,
      siteTitle,
      siteDescription,
      author: "Gojo Solutions PLC",
      ogSiteName: "Gojo Solutions PLC",
      ogTitle: siteTitle,
      ogDescription: siteDescription,
      ogType: "website",
      ogImagePath: DEFAULT_OG,
      twitterCard: "summary_large_image",
      twitterTitle: siteTitle,
      twitterDescription: siteDescription,
      twitterImagePath: DEFAULT_OG,
    })
    .run();

  const nav = [
    { label: "Home", href: "/", sortOrder: 0 },
    { label: "About", href: "/about", sortOrder: 1 },
    { label: "What We Do", href: "/what-we-do", sortOrder: 2 },
    { label: "Gojo Shop", href: "/gojo-shop", sortOrder: 3 },
    { label: "Partnerships", href: "/partnerships", sortOrder: 4 },
    { label: "Contact", href: "/contact", sortOrder: 5 },
  ];
  for (const n of nav) {
    db.insert(navLinks).values({ ...n, isVisible: 1 }).run();
  }
  for (const n of nav.slice(1)) {
    db.insert(footerLinks)
      .values({ label: n.label, href: n.href, sortOrder: n.sortOrder - 1, isVisible: 1 })
      .run();
  }

  promise.forEach((p, i) => {
    db.insert(promiseItems)
      .values({ title: p.title, body: p.body, sortOrder: i, isVisible: 1 })
      .run();
  });

  audiencesSeed.forEach((a, i) => {
    db.insert(audiences)
      .values({ label: a.label, body: a.body, sortOrder: i, isVisible: 1 })
      .run();
  });

  capabilitiesSeed.forEach((c, i) => {
    const result = db
      .insert(capabilities)
      .values({
        slug: c.slug,
        title: c.title,
        shortDesc: c.short,
        strategicPurpose: c.strategicPurpose,
        body: c.strategicPurpose,
        pageEyebrow: "Capability",
        sortOrder: i,
        isVisible: 1,
      })
      .returning({ id: capabilities.id })
      .get();
    c.keyFunctions.forEach((label, fi) => {
      db.insert(capabilityFunctions)
        .values({ capabilityId: result.id, label, sortOrder: fi })
        .run();
    });
  });

  const aboutBlockSeed = [
    {
      label: "Purpose",
      body: "To make commerce in Ethiopia more reliable, efficient, and accessible — for customers, vendors, and the market as a whole.",
    },
    {
      label: "Vision",
      body: "A commerce ecosystem where trust is the default: where prices are fair, quality is accountable, and delivery is a promise that holds.",
    },
    {
      label: "Mission",
      body: "Build the infrastructure, systems, and partnerships that let Ethiopian commerce operate at a higher standard — with Gojo Shop as the proof, and five capability arms as the engine room.",
    },
    {
      label: "Corporate philosophy",
      body: "Identify the problem. Build the solution. Execute now. We work upstream, ship real systems, and hold ourselves to the same standard we ask of every vendor on the platform.",
    },
  ];
  aboutBlockSeed.forEach((b, i) => {
    db.insert(aboutBlocks)
      .values({ label: b.label, body: b.body, sortOrder: i, isVisible: 1 })
      .run();
  });

  company.founders.forEach((f, i) => {
    db.insert(founders)
      .values({ name: f.name, role: f.role, sortOrder: i, isVisible: 1 })
      .run();
  });

  const homeSectionSeed = [
    {
      sectionKey: "hero",
      eyebrow: "Gojo Solutions PLC · Addis Ababa",
      heading: "Trust-driven commerce infrastructure for Ethiopia.",
      body: company.positioning,
      ctaLabel: "Visit Gojo Shop",
      ctaHref: company.shopUrl,
      cta2Label: "Partner with us",
      cta2Href: "/contact",
    },
    {
      sectionKey: "tagline_moment",
      heading: "Identify the problem. Build the solution. Execute now.",
      body: "Our operating philosophy — not a slogan.",
    },
    {
      sectionKey: "hub_spoke",
      eyebrow: "Structure",
      heading: "One core engine.\nFive supporting capabilities.",
      body: "Gojo Shop is the platform 20,000+ Ethiopian customers already use. Around it, five specialist arms of Gojo Solutions handle the upstream and downstream work that makes it dependable — from import and logistics to digital infrastructure and market development.",
      ctaLabel: "Explore what we do →",
      ctaHref: "/what-we-do",
    },
    {
      sectionKey: "promise_section",
      eyebrow: "The Gojo Promise",
      heading: "A promise, held together by three commitments.",
    },
    {
      sectionKey: "audiences_section",
      eyebrow: "",
      heading: "",
    },
    {
      sectionKey: "work_with_us",
      eyebrow: "Work with us",
      heading: "Build the next layer of Ethiopian commerce with us.",
      body: "Whether you're a vendor, a logistics operator, a bank, or an international supplier — we're building the infrastructure alongside you.",
      ctaLabel: "Partnerships",
      ctaHref: "/partnerships",
      cta2Label: "Contact us",
      cta2Href: "/contact",
    },
    {
      sectionKey: "capabilities_grid",
      eyebrow: "Capabilities at a glance",
    },
    {
      sectionKey: "nav_cta",
      ctaLabel: "Visit Gojo Shop →",
      ctaHref: company.shopUrl,
    },
    {
      sectionKey: "about_founders_header",
      eyebrow: "Founders",
      heading: "Three founders. One operating philosophy.",
    },
    {
      sectionKey: "promise_figure",
      eyebrow: "The Gojo Promise",
      heading: "Quality you can trust.\nPrices that make sense.\nDelivery you can rely on.",
      body: "The three pillars of the Gojo Promise.",
    },
  ];
  for (const s of homeSectionSeed) {
    db.insert(homeSections).values(s).run();
  }

  const pages = [
    {
      pageKey: "home",
      title: siteTitle,
      description: siteDescription,
      ogTitle: siteTitle,
      ogDescription: siteDescription,
      ogUrl: "/",
      canonical: "/",
    },
    {
      pageKey: "about",
      title: "About — Gojo Solutions PLC",
      description:
        "Purpose, vision, mission, and the founders behind Gojo Solutions PLC — the parent company of Gojo Shop.",
      ogTitle: "About Gojo Solutions PLC",
      ogDescription:
        "The purpose, philosophy, and people behind Ethiopia's trust-driven commerce infrastructure company.",
      ogUrl: "/about",
      canonical: "/about",
    },
    {
      pageKey: "what-we-do",
      title: "What We Do — Gojo Solutions PLC",
      description:
        "Five capability arms supporting one core engine: import & trade, digital platform, logistics & fulfillment, investment & consulting, and marketing & market development.",
      ogTitle: "What We Do — Gojo Solutions PLC",
      ogDescription:
        "The five capability arms of Gojo Solutions PLC, and how each one strengthens Gojo Shop.",
      ogUrl: "/what-we-do",
      canonical: "/what-we-do",
    },
    {
      pageKey: "gojo-shop",
      title: "Gojo Shop — The core engine of Gojo Solutions PLC",
      description:
        "Gojo Shop is Ethiopia's trust-driven multi-vendor e-commerce platform with 20,000+ users and a verified Cash-on-Delivery model. It's the core engine of Gojo Solutions PLC.",
      ogTitle: "Gojo Shop — the core engine",
      ogDescription:
        "Ethiopia's trust-driven multi-vendor e-commerce platform. 20,000+ users. Cash-on-Delivery. Verified fulfillment.",
      ogUrl: "/gojo-shop",
      canonical: "/gojo-shop",
    },
    {
      pageKey: "partnerships",
      title: "Partnerships & Vendors — Gojo Solutions PLC",
      description:
        "Vendor value proposition, quality accountability standards, and international partnership opportunities with Gojo Solutions PLC.",
      ogTitle: "Partnerships & Vendors — Gojo Solutions PLC",
      ogDescription:
        "Build with the infrastructure company behind Gojo Shop. For vendors, banks, logistics operators, and international suppliers.",
      ogUrl: "/partnerships",
      canonical: "/partnerships",
    },
    {
      pageKey: "contact",
      title: "Contact — Gojo Solutions PLC",
      description:
        "Reach the Gojo Solutions PLC team in Addis Ababa — for vendors, partners, banks, and international suppliers.",
      ogTitle: "Contact Gojo Solutions PLC",
      ogDescription: "Get in touch with Gojo Solutions PLC in Addis Ababa.",
      ogUrl: "/contact",
      canonical: "/contact",
    },
  ];
  for (const p of pages) {
    db.insert(pageMeta).values(p).run();
  }

  db.insert(gojoShopPage)
    .values({
      id: 1,
      heroEyebrow: "Core engine",
      heroHeading: "Gojo Shop is where the promise ships.",
      heroBody:
        "Gojo Shop is Ethiopia's trust-driven multi-vendor commerce platform — 20,000+ users, Cash-on-Delivery by default, and vendors held to a standard of quality accountability. Everything else Gojo Solutions does exists to make this platform more reliable.",
      heroCtaLabel: "Open gojoshop.et ↗",
      stat1Label: "Active users",
      stat1Value: "20,000+",
      stat2Label: "Model",
      stat2Value: "Cash on Delivery",
      stat3Label: "Type",
      stat3Value: "Multi-vendor",
      stat4Label: "Market",
      stat4Value: "Ethiopia",
      workflowEyebrow: "Inside the platform",
      workflowHeading: "How Gojo Shop works, end to end.",
      promiseEyebrow: "The Gojo Promise, on the platform",
      promiseHeading: "What every Gojo Shop transaction is engineered to guarantee.",
    })
    .run();

  const workflows = [
    {
      title: "Order flow",
      body: "From browse to Cash-on-Delivery confirmation — a workflow designed for buyers who need to see the product before they pay.",
      imagePath: null as string | null,
      sortOrder: 0,
    },
    {
      title: "Vendor dashboard",
      body: "The operations surface Ethiopian vendors use to list, manage, and fulfill orders with accountability.",
      imagePath: null,
      sortOrder: 1,
    },
    {
      title: "Delivery verification",
      body: "The final-mile check that closes the trust gap between order placed and cash exchanged.",
      imagePath: null,
      sortOrder: 2,
    },
  ];
  for (const w of workflows) {
    db.insert(gojoShopWorkflowImages)
      .values({ ...w, isVisible: 1 })
      .run();
  }

  db.insert(partnershipsPage)
    .values({
      id: 1,
      headerEyebrow: "Partnerships & vendors",
      headerHeading: "We build alongside partners who take trust seriously.",
      headerBody:
        "Gojo Solutions works with vendors, banks, logistics operators, and international suppliers to build commerce infrastructure at national scale. If you're building for the long term, we should talk.",
      vendorSectionEyebrow: "For vendors",
      vendorSectionHeading: "Sell on infrastructure, not just a marketplace.",
      standardsEyebrow: "Evaluation standards",
      standardsHeading: "Quality accountability, held in writing.",
      standardsBody:
        "Every vendor on Gojo Shop meets — and continues to meet — a defined standard. It's how we protect the platform's most valuable asset: trust.",
      institutionalEyebrow: "International & institutional",
      institutionalHeading: "Who we partner with beyond the storefront.",
      ctaText: "Start a conversation with the partnerships team.",
      ctaSubtitle:
        "Tell us who you are and what you're building. We'll come back within a few business days.",
      ctaButtonLabel: "Contact partnerships →",
      ctaButtonHref: "/contact",
    })
    .run();

  const vendorProps = [
    {
      title: "Reach a verified buyer base",
      body: "20,000+ Gojo Shop users already trust the platform. Vendors inherit that trust from day one.",
    },
    {
      title: "Operate on real infrastructure",
      body: "Fulfillment, delivery verification, and Cash-on-Delivery reconciliation are handled — you focus on product.",
    },
    {
      title: "Grow with upstream support",
      body: "Import, sourcing, and market development capabilities are available to serious vendor partners.",
    },
  ];
  vendorProps.forEach((v, i) => {
    db.insert(vendorValueProps)
      .values({ ...v, sortOrder: i, isVisible: 1 })
      .run();
  });

  const standards = [
    "Product authenticity and accurate listing information",
    "Response times for order confirmation and dispatch",
    "Consistent fulfillment quality across delivery cycles",
    "Transparent handling of returns and disputes",
  ];
  standards.forEach((label, i) => {
    db.insert(partnershipStandards)
      .values({ label, sortOrder: i, isVisible: 1 })
      .run();
  });

  const partners = [
    {
      title: "Financial institutions",
      example: "e.g. Siinqee Bank–style banking partnerships",
      body: "Payments, escrow, merchant financing, and reconciliation infrastructure.",
    },
    {
      title: "Logistics operators",
      example: null as string | null,
      body: "Regional fulfillment networks, verified last-mile, and warehouse partnerships.",
    },
    {
      title: "International suppliers",
      example: null,
      body: "Wholesale, category-brand, and manufacturer partnerships targeting the Ethiopian market.",
    },
    {
      title: "Technology partners",
      example: null,
      body: "Systems integrations with our digital platform — payments, identity, logistics APIs.",
    },
  ];
  partners.forEach((p, i) => {
    db.insert(partnerTypes)
      .values({ ...p, sortOrder: i, isVisible: 1 })
      .run();
  });

  db.insert(contactPage)
    .values({
      id: 1,
      headerEyebrow: "Contact",
      headerHeading: "Talk to Gojo Solutions.",
      headerBody:
        "We work with vendors, partners, and institutions building the infrastructure of Ethiopian commerce. Send us a note — we read everything.",
      headOfficeLabel: "Head office",
      emailLabel: "Email",
      phoneLabel: "Phone",
      phoneNumber: "+251982808182",
      showPhone: 1,
      platformLabel: "Platform",
      formNote: "Your message is saved securely. We typically reply within a few business days.",
    })
    .run();

  const interests = [
    "Partnership",
    "Vendor onboarding",
    "Investment / consulting",
    "Media / press",
    "General inquiry",
  ];
  interests.forEach((label, i) => {
    db.insert(contactInterestOptions)
      .values({ label, sortOrder: i, isVisible: 1 })
      .run();
  });

  db.insert(aboutPageHeader)
    .values({
      id: 1,
      eyebrow: "About",
      heading: "A holding company built to move Ethiopian commerce forward.",
      body: company.positioning,
    })
    .run();

  db.insert(whatWeDoPageHeader)
    .values({
      id: 1,
      eyebrow: "What we do",
      heading: "Five capabilities. One purpose: make commerce work.",
      body: "Each arm of Gojo Solutions exists to remove a specific point of friction in Ethiopian commerce. Together, they make Gojo Shop possible — and make it repeatable for partners who plug in.",
    })
    .run();

  console.log("Seed complete.");
  console.log("  Admin login: admin / ChangeMe123!");
  console.log("  Change the password on first login via /admin/settings");
}

if (import.meta.main) {
  const force = process.argv.includes("--force");
  await runSeed({ force });
}
