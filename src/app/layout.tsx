import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDFNinja - Swift PDF Mastery | Free PDF Tools",
  description:
    "Handle your PDFs with ninja-like precision. Fast, intuitive tools for merging, splitting and managing your PDF documents.",
  keywords:
    "PDF tools, merge PDF, split PDF, PDF editor, free PDF tools, online PDF tools",
  authors: [{ name: "PDFNinja Team" }],
  creator: "PDFNinja",
  publisher: "PDFNinja",
  openGraph: {
    title: "PDFNinja - Swift PDF Mastery | Free PDF Tools",
    description:
      "Handle your PDFs with ninja-like precision. Fast, intuitive tools for merging, splitting and managing your PDF documents.",
    url: "https://pdfninja.com",
    siteName: "PDFNinja",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PDFNinja - Swift PDF Mastery",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFNinja - Swift PDF Mastery | Free PDF Tools",
    description:
      "Handle your PDFs with ninja-like precision. Fast, intuitive tools for merging, splitting and managing your PDF documents.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://pdfninja.com"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${poppins.className} min-h-screen flex flex-col`}
      >
        <div className="flex-grow flex flex-col">
          <Navigation />
          <div className="flex-grow">{children}</div>
        </div>
      </body>
    </html>
  );
}
