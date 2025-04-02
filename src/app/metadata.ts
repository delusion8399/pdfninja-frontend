import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Ninja - PDF Tools",
  description:
    "Free online PDF tools for merging, splitting, compressing, and more.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  themeColor: "#0F172A",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdfninja.app",
    siteName: "PDF Ninja",
    title: "PDF Ninja - PDF Tools",
    description:
      "Free online PDF tools for merging, splitting, compressing, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDF Ninja",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Ninja - PDF Tools",
    description:
      "Free online PDF tools for merging, splitting, compressing, and more.",
    images: ["/og-image.png"],
  },
};
