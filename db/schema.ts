import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

const now = () => new Date().toISOString();

export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  forcePasswordChange: integer("force_password_change").notNull().default(1),
  createdAt: text("created_at").notNull().$defaultFn(now),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(now),
});

export const companyInfo = sqliteTable("company_info", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  tagline: text("tagline").notNull(),
  positioning: text("positioning").notNull(),
  location: text("location").notNull(),
  shopUrl: text("shop_url").notNull(),
  contactEmail: text("contact_email").notNull(),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const logo = sqliteTable("logo", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  variant: text("variant").notNull(),
  filePath: text("file_path").notNull(),
  altText: text("alt_text").notNull(),
  isActive: integer("is_active").notNull().default(1),
  uploadedAt: text("uploaded_at").notNull().$defaultFn(now),
});

export const globalMeta = sqliteTable("global_meta", {
  id: integer("id").primaryKey(),
  siteTitle: text("site_title").notNull(),
  siteDescription: text("site_description").notNull(),
  author: text("author").notNull(),
  ogSiteName: text("og_site_name").notNull(),
  ogTitle: text("og_title").notNull(),
  ogDescription: text("og_description").notNull(),
  ogType: text("og_type").notNull().default("website"),
  ogImagePath: text("og_image_path"),
  twitterCard: text("twitter_card").notNull().default("summary_large_image"),
  twitterTitle: text("twitter_title").notNull(),
  twitterDescription: text("twitter_description").notNull(),
  twitterImagePath: text("twitter_image_path"),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const navLinks = sqliteTable("nav_links", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  href: text("href").notNull(),
  sortOrder: integer("sort_order").notNull(),
  isVisible: integer("is_visible").notNull().default(1),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const footerLinks = sqliteTable("footer_links", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  href: text("href").notNull(),
  sortOrder: integer("sort_order").notNull(),
  isVisible: integer("is_visible").notNull().default(1),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const promiseItems = sqliteTable("promise_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  sortOrder: integer("sort_order").notNull(),
  isVisible: integer("is_visible").notNull().default(1),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const audiences = sqliteTable("audiences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  body: text("body").notNull(),
  sortOrder: integer("sort_order").notNull(),
  isVisible: integer("is_visible").notNull().default(1),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const capabilities = sqliteTable("capabilities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  shortDesc: text("short_desc").notNull(),
  strategicPurpose: text("strategic_purpose").notNull(),
  /** Long-form page body (multi-paragraph). Shown on /capabilities/$slug */
  body: text("body"),
  pageEyebrow: text("page_eyebrow"),
  heroImagePath: text("hero_image_path"),
  cardImagePath: text("card_image_path"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  sortOrder: integer("sort_order").notNull(),
  isVisible: integer("is_visible").notNull().default(1),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const capabilityFunctions = sqliteTable("capability_functions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  capabilityId: integer("capability_id")
    .notNull()
    .references(() => capabilities.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const capabilitiesRelations = relations(capabilities, ({ many }) => ({
  functions: many(capabilityFunctions),
}));

export const capabilityFunctionsRelations = relations(capabilityFunctions, ({ one }) => ({
  capability: one(capabilities, {
    fields: [capabilityFunctions.capabilityId],
    references: [capabilities.id],
  }),
}));

export const aboutBlocks = sqliteTable("about_blocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  body: text("body").notNull(),
  sortOrder: integer("sort_order").notNull(),
  isVisible: integer("is_visible").notNull().default(1),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const founders = sqliteTable("founders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio"),
  photoPath: text("photo_path"),
  sortOrder: integer("sort_order").notNull(),
  isVisible: integer("is_visible").notNull().default(1),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const homeSections = sqliteTable("home_sections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sectionKey: text("section_key").notNull().unique(),
  eyebrow: text("eyebrow"),
  heading: text("heading"),
  body: text("body"),
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
  cta2Label: text("cta2_label"),
  cta2Href: text("cta2_href"),
  imagePath: text("image_path"),
  isVisible: integer("is_visible").notNull().default(1),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const pageMeta = sqliteTable("page_meta", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pageKey: text("page_key").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ogTitle: text("og_title").notNull(),
  ogDescription: text("og_description").notNull(),
  ogUrl: text("og_url").notNull(),
  canonical: text("canonical").notNull(),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const gojoShopPage = sqliteTable("gojo_shop_page", {
  id: integer("id").primaryKey(),
  heroEyebrow: text("hero_eyebrow").notNull(),
  heroHeading: text("hero_heading").notNull(),
  heroBody: text("hero_body").notNull(),
  heroCtaLabel: text("hero_cta_label").notNull(),
  stat1Label: text("stat1_label").notNull(),
  stat1Value: text("stat1_value").notNull(),
  stat2Label: text("stat2_label").notNull(),
  stat2Value: text("stat2_value").notNull(),
  stat3Label: text("stat3_label").notNull(),
  stat3Value: text("stat3_value").notNull(),
  stat4Label: text("stat4_label").notNull(),
  stat4Value: text("stat4_value").notNull(),
  workflowEyebrow: text("workflow_eyebrow").notNull(),
  workflowHeading: text("workflow_heading").notNull(),
  galleryEyebrow: text("gallery_eyebrow").notNull().default("Gallery"),
  galleryHeading: text("gallery_heading")
    .notNull()
    .default("A closer look at Gojo Shop."),
  promiseEyebrow: text("promise_eyebrow").notNull(),
  promiseHeading: text("promise_heading").notNull(),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const gojoShopWorkflowImages = sqliteTable("gojo_shop_workflow_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  imagePath: text("image_path"),
  sortOrder: integer("sort_order").notNull(),
  isVisible: integer("is_visible").notNull().default(1),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

/** Extra Gojo Shop gallery images (paginated + lightbox on public page). */
export const gojoShopGallery = sqliteTable("gojo_shop_gallery", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull().default(""),
  caption: text("caption"),
  imagePath: text("image_path").notNull(),
  sortOrder: integer("sort_order").notNull(),
  isVisible: integer("is_visible").notNull().default(1),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const partnershipsPage = sqliteTable("partnerships_page", {
  id: integer("id").primaryKey(),
  headerEyebrow: text("header_eyebrow").notNull(),
  headerHeading: text("header_heading").notNull(),
  headerBody: text("header_body").notNull(),
  heroImagePath: text("hero_image_path"),
  vendorSectionEyebrow: text("vendor_section_eyebrow"),
  vendorSectionHeading: text("vendor_section_heading"),
  standardsEyebrow: text("standards_eyebrow").notNull(),
  standardsHeading: text("standards_heading").notNull(),
  standardsBody: text("standards_body").notNull(),
  institutionalEyebrow: text("institutional_eyebrow").notNull(),
  institutionalHeading: text("institutional_heading").notNull(),
  ctaText: text("cta_text").notNull(),
  ctaSubtitle: text("cta_subtitle").notNull(),
  ctaButtonLabel: text("cta_button_label").notNull(),
  ctaButtonHref: text("cta_button_href").notNull(),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const vendorValueProps = sqliteTable("vendor_value_props", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  sortOrder: integer("sort_order").notNull(),
  isVisible: integer("is_visible").notNull().default(1),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const partnershipStandards = sqliteTable("partnership_standards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull(),
  isVisible: integer("is_visible").notNull().default(1),
});

export const partnerTypes = sqliteTable("partner_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  example: text("example"),
  body: text("body").notNull(),
  logoPath: text("logo_path"),
  sortOrder: integer("sort_order").notNull(),
  isVisible: integer("is_visible").notNull().default(1),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const contactPage = sqliteTable("contact_page", {
  id: integer("id").primaryKey(),
  headerEyebrow: text("header_eyebrow").notNull(),
  headerHeading: text("header_heading").notNull(),
  headerBody: text("header_body").notNull(),
  headOfficeLabel: text("head_office_label").notNull().default("Head office"),
  emailLabel: text("email_label").notNull().default("Email"),
  phoneLabel: text("phone_label").notNull().default("Phone"),
  phoneNumber: text("phone_number").default("+251982808182"),
  showPhone: integer("show_phone").notNull().default(1),
  platformLabel: text("platform_label").notNull().default("Platform"),
  formNote: text("form_note"),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const contactInterestOptions = sqliteTable("contact_interest_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull(),
  isVisible: integer("is_visible").notNull().default(1),
});

/** Inbound contact / partnership inquiries from the public site. */
export const contactMessages = sqliteTable("contact_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  organization: text("organization"),
  interest: text("interest").notNull(),
  message: text("message").notNull(),
  /** Where the form was submitted from: contact | partnerships */
  source: text("source").notNull().default("contact"),
  isRead: integer("is_read").notNull().default(0),
  createdAt: text("created_at").notNull().$defaultFn(now),
});

export const aboutPageHeader = sqliteTable("about_page_header", {
  id: integer("id").primaryKey(),
  eyebrow: text("eyebrow").notNull(),
  heading: text("heading").notNull(),
  body: text("body").notNull(),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const whatWeDoPageHeader = sqliteTable("what_we_do_page_header", {
  id: integer("id").primaryKey(),
  eyebrow: text("eyebrow").notNull(),
  heading: text("heading").notNull(),
  body: text("body").notNull(),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const schema = {
  adminUsers,
  sessions,
  companyInfo,
  logo,
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
  gojoShopGallery,
  partnershipsPage,
  vendorValueProps,
  partnershipStandards,
  partnerTypes,
  contactPage,
  contactInterestOptions,
  contactMessages,
  aboutPageHeader,
  whatWeDoPageHeader,
};
