import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Files | PDFNinja - Free PDF Compression Tool",
  description:
    "Reduce PDF file size without losing quality with our easy-to-use PDF compression tool. Optimize your PDFs for faster sharing and storage.",
  keywords:
    "compress PDF, reduce PDF size, PDF compression, optimize PDF, free PDF compressor, shrink PDF",
  openGraph: {
    title: "Compress PDF Files | PDFNinja - Free PDF Compression Tool",
    description:
      "Reduce PDF file size without losing quality with our easy-to-use PDF compression tool. Optimize your PDFs for faster sharing and storage.",
    url: "https://pdfninja.com/compress",
    images: [
      {
        url: "/compress-og-image.svg",
        width: 1200,
        height: 630,
        alt: "PDFNinja PDF Compression Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress PDF Files | PDFNinja - Free PDF Compression Tool",
    description:
      "Reduce PDF file size without losing quality with our easy-to-use PDF compression tool. Optimize your PDFs for faster sharing and storage.",
    images: ["/compress-og-image.svg"],
  },
};
