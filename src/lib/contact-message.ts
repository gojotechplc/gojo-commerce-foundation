import { z } from "zod";

/** Keep payloads small — rejects oversized spam-ish submissions. */
export const CONTACT_LIMITS = {
  name: 80,
  email: 120,
  phone: 40,
  organization: 120,
  interest: 80,
  message: 2000,
} as const;

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, "Enter a valid email")
  .max(CONTACT_LIMITS.email, "Email is too long")
  .email("Enter a valid email address")
  .refine((v) => !v.includes(" "), "Enter a valid email address")
  .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email address");

const optionalPhone = z
  .string()
  .trim()
  .max(CONTACT_LIMITS.phone, "Phone number is too long")
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null))
  .refine(
    (v) => v === null || /^[+0-9()\-\s.]{7,40}$/.test(v),
    "Enter a valid phone number",
  );

export const contactMessageInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name is required")
    .max(CONTACT_LIMITS.name, `Name must be under ${CONTACT_LIMITS.name} characters`),
  email: emailSchema,
  phone: optionalPhone,
  organization: z
    .string()
    .trim()
    .max(CONTACT_LIMITS.organization, "Organization is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  interest: z
    .string()
    .trim()
    .min(1, "Select an interest")
    .max(CONTACT_LIMITS.interest, "Interest is too long"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(CONTACT_LIMITS.message, `Message must be under ${CONTACT_LIMITS.message} characters`),
  source: z.enum(["contact", "partnerships"]).default("contact"),
});

export type ContactMessageInput = z.infer<typeof contactMessageInputSchema>;

export function parseContactMessageInput(raw: unknown): ContactMessageInput {
  const parsed = contactMessageInputSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid submission";
    throw new Error(first);
  }
  return parsed.data;
}

export const MESSAGE_PAGE_SIZE = 20;

export type MessageListFilter = {
  page?: number;
  pageSize?: number;
  source?: "all" | "contact" | "partnerships";
  status?: "all" | "read" | "unread";
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  interest?: string;
};

export function normalizeMessageListFilter(raw: MessageListFilter = {}): Required<
  Pick<MessageListFilter, "page" | "pageSize" | "source" | "status">
> &
  MessageListFilter {
  const page = Math.max(1, Number(raw.page) || 1);
  const pageSize = Math.min(50, Math.max(5, Number(raw.pageSize) || MESSAGE_PAGE_SIZE));
  const source =
    raw.source === "contact" || raw.source === "partnerships" ? raw.source : "all";
  const status = raw.status === "read" || raw.status === "unread" ? raw.status : "all";
  return {
    page,
    pageSize,
    source,
    status,
    from: raw.from?.trim() || undefined,
    to: raw.to?.trim() || undefined,
    interest: raw.interest?.trim() || undefined,
  };
}
