export const company = {
  name: "Gojo Solutions PLC",
  shortName: "Gojo Solutions",
  tagline: "Identify the problem. Build the solution. Execute now.",
  positioning:
    "Gojo Solutions PLC is a trust-driven commerce and business solutions company that builds the infrastructure, systems, and partnerships required to make commerce more reliable, efficient, and accessible in Ethiopia.",
  location: "Addis Ababa, Ethiopia",
  shopUrl: "https://gojoshop.et",
  contactEmail: "info@gojosolutions.et",
  founders: [
    { name: "Abraham Sisay", role: "Co-founder" },
    { name: "Negusu Sisay", role: "Co-founder" },
    { name: "Samson Tesfaye", role: "Co-founder" },
  ],
} as const;

export const promise = [
  {
    title: "Quality You Can Trust",
    body: "Every vendor and every product on our platform is held to a standard of accountability. Trust is the currency we build with — not a marketing claim.",
  },
  {
    title: "Prices That Make Sense",
    body: "We work upstream — in sourcing, import, and logistics — so that fair pricing reaches customers without eroding vendor margins.",
  },
  {
    title: "Delivery You Can Rely On",
    body: "Our Cash-on-Delivery model and verified fulfillment network exist to close the trust gap between promise and doorstep.",
  },
] as const;

export const audiences = [
  {
    label: "For Customers",
    body: "A commerce experience built around verification, fair pricing, and delivery that shows up.",
  },
  {
    label: "For Vendors",
    body: "Infrastructure, tooling, and market reach that let Ethiopian merchants sell with confidence and scale.",
  },
  {
    label: "For the Market",
    body: "Systems and partnerships — with banks, logistics operators, and international suppliers — that raise the floor for commerce nationwide.",
  },
] as const;

export type Capability = {
  slug: string;
  title: string;
  short: string;
  keyFunctions: string[];
  strategicPurpose: string;
};

export const capabilities: Capability[] = [
  {
    slug: "import-trade",
    title: "Import & Trade Solutions",
    short:
      "Sourcing, import, and supply operations that secure quality goods at scale for the Ethiopian market.",
    keyFunctions: [
      "International sourcing and supplier vetting",
      "Import logistics, customs, and clearance",
      "Wholesale supply into the Gojo Shop vendor network",
    ],
    strategicPurpose:
      "Own the upstream so that quality and price on the shelf are engineered, not accidental.",
  },
  {
    slug: "digital-platform",
    title: "Digital Platform & IT Solutions",
    short:
      "The technology backbone behind Gojo Shop and the systems that let partners plug in.",
    keyFunctions: [
      "Multi-vendor e-commerce platform engineering",
      "Vendor and operations tooling",
      "APIs and integrations for banking, payments, and logistics partners",
    ],
    strategicPurpose:
      "Build commerce infrastructure that other Ethiopian businesses can build on.",
  },
  {
    slug: "logistics-fulfillment",
    title: "Logistics & Fulfillment Solutions",
    short:
      "The verified last-mile network that makes Cash-on-Delivery a promise, not a gamble.",
    keyFunctions: [
      "Order routing and fulfillment coordination",
      "Delivery verification and cash reconciliation",
      "Nationwide coverage through partner operators",
    ],
    strategicPurpose:
      "Close the trust gap between order and doorstep — the single biggest barrier to Ethiopian e-commerce.",
  },
  {
    slug: "investment-consulting",
    title: "Investment & Business Consulting",
    short:
      "Capital, structure, and strategy for ventures that strengthen the commerce ecosystem.",
    keyFunctions: [
      "Strategic investment in complementary ventures",
      "Business structuring and operational consulting",
      "Partnership development with financial institutions",
    ],
    strategicPurpose:
      "Grow the ecosystem around the core engine — not just the engine itself.",
  },
  {
    slug: "marketing-market-development",
    title: "Marketing & Market Development",
    short:
      "Building demand, category education, and vendor onboarding across Ethiopia.",
    keyFunctions: [
      "Brand and category marketing",
      "Vendor onboarding and enablement",
      "Regional market development campaigns",
    ],
    strategicPurpose:
      "Grow the market itself — not just our share of it.",
  },
];
