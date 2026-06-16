import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { COMPANY } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const url = `https://${COMPANY.domain}`;

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: `${COMPANY.name} — Premium Digital Agency`,
    template: `%s | ${COMPANY.name}`,
  },
  description:
    "Tech Solutions Pakistan delivers enterprise software, web & mobile development, big data, and AI automation. 400+ projects delivered across 12+ industries.",
  keywords: [
    "software development Pakistan",
    "web development",
    "mobile apps",
    "AI automation",
    "big data engineering",
    "AI chatbots",
    "digital agency",
  ],
  authors: [{ name: COMPANY.name }],
  openGraph: {
    type: "website",
    url,
    title: `${COMPANY.name} — Premium Digital Agency`,
    description:
      "Enterprise software, web & mobile development, big data, and AI automation. 400+ projects delivered.",
    siteName: COMPANY.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${COMPANY.name} — Premium Digital Agency`,
    description:
      "Enterprise software, web & mobile development, big data, and AI automation.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='light')document.documentElement.classList.add('light')}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: COMPANY.name,
              alternateName: COMPANY.shortName,
              url,
              logo: `${url}/icon.svg`,
              email: COMPANY.email,
              telephone: COMPANY.phone,
              description:
                "Premium digital agency delivering enterprise software, web & mobile development, big data, and AI automation, plus a SaaS platform for IT companies.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Lahore",
                addressRegion: "Punjab",
                addressCountry: "PK",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: COMPANY.name,
              url,
            }),
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
