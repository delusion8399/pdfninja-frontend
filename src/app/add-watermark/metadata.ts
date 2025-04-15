import { Metadata } from "next";
import { viewport } from "../viewport";

export const metadata: Metadata = {
  title: "Add Watermark to PDF - PDFNinja",
  description:
    "Add text or image watermarks to your PDF documents with customizable position, opacity, and rotation.",
  openGraph: {
    images: ["/watermark-og-image.svg"],
  },
};

export { viewport };
