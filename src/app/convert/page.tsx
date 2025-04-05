"use client";

import React from "react";
import Link from "next/link";

const conversionTools = [
  {
    title: "JPG to PDF",
    description: "Convert JPG images to PDF format",
    icon: "🖼️",
    href: "/convert/jpg-to-pdf",
  },
  {
    title: "Word to PDF",
    description: "Convert Word documents to PDF format",
    icon: "📝",
    href: "/convert/word-to-pdf",
  },
  {
    title: "PowerPoint to PDF",
    description: "Convert PowerPoint presentations to PDF format",
    icon: "📊",
    href: "/convert/powerpoint-to-pdf",
  },
  {
    title: "Excel to PDF",
    description: "Convert Excel spreadsheets to PDF format",
    icon: "📈",
    href: "/convert/excel-to-pdf",
  },
  {
    title: "HTML to PDF",
    description: "Convert HTML files to PDF format",
    icon: "🌐",
    href: "/convert/html-to-pdf",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-[#FFDE59] antialiased">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border-4 border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 hover:rotate-0 hover:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight transform rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-300">
            Convert to PDF
          </h1>
          <p className="text-xl text-black mb-6 max-w-3xl mx-auto leading-relaxed font-medium transform hover:scale-105 transition-transform duration-300">
            Convert your files to PDF format with high quality and ease. Choose from various file types to convert.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conversionTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-300 relative hover:scale-105"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">{tool.icon}</span>
                <h2 className="text-xl font-black text-black transform group-hover:translate-x-[-2px] group-hover:scale-105 transition-all duration-300">{tool.title}</h2>
              </div>
              <p className="text-black font-medium transform group-hover:translate-x-[-2px] transition-transform duration-300">{tool.description}</p>
              <div className="absolute -top-2 -right-2 bg-[#4DCCFF] border-3 border-black p-2 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                <span className="text-sm font-black">FREE</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
} 