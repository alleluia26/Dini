import type { Metadata } from "next";

import { MenuExperience } from "@/components/menu/menu-experience";
import { getPublicMenuData } from "@/lib/public/menu-data";
import { getSiteUrl } from "@/lib/public/site-url";

const defaultTitle = "Dini Hotel | Digital Menu";

// The public menu is database-backed and must remain deployable when Neon is
// temporarily unavailable during a build. It is rendered fresh on the server.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [data, siteUrl] = await Promise.all([getPublicMenuData(), getSiteUrl()]);
  const isReady = data.status === "ready";
  const title = isReady ? `${data.settings.hotelName} | Digital Menu` : defaultTitle;
  const description = "Explore the Dini Hotel digital menu.";
  const canonical = siteUrl ? new URL("/menu", siteUrl) : undefined;
  return {
    title: { absolute: title },
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      images: undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function MenuPage() {
  const data = await getPublicMenuData();
  const siteUrl = getSiteUrl();
  const jsonLd =
    data.status === "ready"
      ? {
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: data.settings.hotelName,
          ...(siteUrl ? { url: new URL("/menu", siteUrl).toString() } : {}),
        }
      : null;

  return (
    <>
      {jsonLd ? (
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
          type="application/ld+json"
        />
      ) : null}
      <MenuExperience data={data} />
    </>
  );
}
