export type SiteChromeData = {
  company: {
    name: string;
    shortName: string;
    tagline: string;
    positioning: string;
    location: string;
    shopUrl: string;
    contactEmail: string;
  };
  logo: { filePath: string; altText: string } | null;
  nav: { label: string; href: string }[];
  footer: { label: string; href: string }[];
  navCtaLabel: string;
  navCtaHref: string;
  navCtaVisible?: boolean;
};
