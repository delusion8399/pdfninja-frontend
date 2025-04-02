import { Metadata } from "next";
import { viewport } from "../viewport";

export const metadata: Metadata = {
  title: "Merge PDF Files | PDFNinja - Free PDF Merger Tool",
  description:
    "Combine multiple PDF files into one document with our easy-to-use PDF merger tool. Drag, drop, and rearrange your PDFs in any order.",
  keywords:
    "merge PDF, combine PDF, PDF merger, join PDF files, PDF combiner, free PDF merger",
  openGraph: {
    title: "Merge PDF Files | PDFNinja - Free PDF Merger Tool",
    description:
      "Combine multiple PDF files into one document with our easy-to-use PDF merger tool. Drag, drop, and rearrange your PDFs in any order.",
    url: "https://pdfninja.com/merge",
    images: [
      {
        url: "/merge-og-image.svg",
        width: 1200,
        height: 630,
        alt: "PDFNinja PDF Merger Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Merge PDF Files | PDFNinja - Free PDF Merger Tool",
    description:
      "Combine multiple PDF files into one document with our easy-to-use PDF merger tool. Drag, drop, and rearrange your PDFs in any order.",
    images: ["/merge-og-image.svg"],
  },
};

export { viewport };
