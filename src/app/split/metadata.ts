import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF Files | PDFNinja - Free PDF Splitter Tool",
  description:
    "Extract specific pages from your PDF documents with our easy-to-use PDF splitter tool. Select individual pages or page ranges to create a new PDF.",
  keywords:
    "split PDF, extract PDF pages, PDF splitter, PDF extractor, free PDF splitter, divide PDF",
  openGraph: {
    title: "Split PDF Files | PDFNinja - Free PDF Splitter Tool",
    description:
      "Extract specific pages from your PDF documents with our easy-to-use PDF splitter tool. Select individual pages or page ranges to create a new PDF.",
    url: "https://pdfninja.com/split",
    images: [
      {
        url: "/split-og-image.svg",
        width: 1200,
        height: 630,
        alt: "PDFNinja PDF Splitter Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Split PDF Files | PDFNinja - Free PDF Splitter Tool",
    description:
      "Extract specific pages from your PDF documents with our easy-to-use PDF splitter tool. Select individual pages or page ranges to create a new PDF.",
    images: ["/split-og-image.svg"],
  },
};
