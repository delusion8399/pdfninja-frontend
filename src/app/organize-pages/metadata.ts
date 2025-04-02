import { Metadata } from "next";
import { viewport } from "../viewport";

export const metadata: Metadata = {
  title: "Organize PDF Pages - PDFNinja",
  description:
    "Rearrange PDF pages by dragging and dropping them into your preferred order.",
  openGraph: {
    images: ["/organize-og-image.svg"],
  },
};

export { viewport };
