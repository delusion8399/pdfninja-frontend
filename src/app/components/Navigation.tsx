"use client";

import Link from "next/link";
import { useState } from "react";

interface NavItem {
  title: string;
  items: {
    name: string;
    href: string;
    icon?: string;
  }[];
}

const navItems: NavItem[] = [
  {
    title: "ORGANIZE PDF",
    items: [
      { name: "Merge PDF", href: "/merge", icon: "📑" },
      { name: "Split PDF", href: "/split", icon: "✂️" },
      { name: "Remove pages", href: "/remove-pages", icon: "🗑️" },
      { name: "Extract pages", href: "/extract-pages", icon: "📄" },
      { name: "Organize PDF", href: "/organize-pages", icon: "📋" },
      { name: "Scan to PDF", href: "#", icon: "📱" },
    ],
  },
  {
    title: "OPTIMIZE PDF",
    items: [
      { name: "Compress PDF", href: "/compress", icon: "🗜️" },
      { name: "Repair PDF", href: "#", icon: "🔧" },
      { name: "OCR PDF", href: "#", icon: "👁️" },
    ],
  },
  {
    title: "CONVERT TO PDF",
    items: [
      { name: "JPG to PDF", href: "#", icon: "🖼️" },
      { name: "WORD to PDF", href: "#", icon: "📝" },
      { name: "POWERPOINT to PDF", href: "#", icon: "📊" },
      { name: "EXCEL to PDF", href: "#", icon: "📈" },
      { name: "HTML to PDF", href: "#", icon: "🌐" },
    ],
  },
  {
    title: "CONVERT FROM PDF",
    items: [
      { name: "PDF to JPG", href: "#", icon: "🖼️" },
      { name: "PDF to WORD", href: "#", icon: "📝" },
      { name: "PDF to POWERPOINT", href: "#", icon: "📊" },
      { name: "PDF to EXCEL", href: "#", icon: "📈" },
      { name: "PDF to PDF/A", href: "#", icon: "📁" },
    ],
  },
  {
    title: "EDIT PDF",
    items: [
      { name: "Rotate PDF", href: "#", icon: "🔄" },
      { name: "Add page numbers", href: "#", icon: "🔢" },
      { name: "Add watermark", href: "#", icon: "💧" },
      { name: "Edit PDF", href: "#", icon: "✏️" },
    ],
  },
  {
    title: "PDF SECURITY",
    items: [
      { name: "Unlock PDF", href: "#", icon: "🔓" },
      { name: "Protect PDF", href: "#", icon: "🔒" },
      { name: "Sign PDF", href: "#", icon: "✍️" },
      { name: "Redact PDF", href: "#", icon: "⬛" },
      { name: "Compare PDF", href: "#", icon: "🔍" },
    ],
  },
];

export default function Navigation() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryHover = (category: string) => {
    setActiveCategory(category);
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
  };

  return (
    <header className="bg-white border-4 border-black sticky top-0 z-[100] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-3xl font-black text-black tracking-tight transform -rotate-2"
          >
            PDFNinja
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-black font-bold hover:text-[#FF3A5E] transition-colors duration-200 transform hover:scale-105"
            >
              Login
            </Link>
            <button className="bg-[#FF3A5E] text-white px-4 py-2 border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* PDF Tools Navigation - Horizontal Menu */}
      <div className="border-t-4 border-black bg-white">
        <div className="max-w-7xl mx-auto">
          <nav className="relative z-[300]" onMouseLeave={handleMouseLeave}>
            <div className="grid grid-cols-6 text-sm">
              {navItems.map((category, idx) => (
                <div
                  key={category.title}
                  className={`relative ${
                    idx < navItems.length - 1 ? "border-r-2 border-black" : ""
                  }`}
                  onMouseEnter={() => handleCategoryHover(category.title)}
                >
                  <div className="py-3 px-2 font-bold text-center hover:bg-[#FFDE59] transition-colors cursor-pointer text-black">
                    {category.title}
                  </div>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute left-0 w-[300px] bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 z-[400] ${
                      activeCategory === category.title
                        ? "opacity-100 visible"
                        : "opacity-0 invisible pointer-events-none"
                    }`}
                  >
                    <div className="grid grid-cols-1 gap-0">
                      {category.items.map((item, index) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center px-4 py-3 text-black font-bold hover:bg-[#FFDE59] ${
                            index !== category.items.length - 1
                              ? "border-b-2 border-black"
                              : ""
                          }`}
                        >
                          {item.icon && (
                            <span className="mr-2 text-xl">{item.icon}</span>
                          )}
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
