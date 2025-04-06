import Link from "next/link";

export default function NeoBrutalismHome() {
  // Define the tools with their routes
  const tools = [
    {
      title: "Merge PDFs",
      description: "Combine multiple documents seamlessly",
      icon: "📑",
      color: "#FF3A5E",
      rotate: "rotate-2",
      href: "/merge",
    },
    {
      title: "Split PDF",
      description: "Divide files with precision",
      icon: "✂️",
      color: "#4DCCFF",
      rotate: "-rotate-1",
      href: "/split",
    },
    {
      title: "Compress PDF",
      description: "Optimize file sizes effortlessly",
      icon: "🗜️",
      color: "#FFDE59",
      rotate: "rotate-1",
      href: "/compress",
    },
    {
      title: "Remove Pages",
      description: "Delete pages you don't need",
      icon: "🗑️",
      color: "#4DCCFF",
      rotate: "-rotate-2",
      href: "/remove-pages",
    },
    {
      title: "Extract Pages",
      description: "Save specific pages as new PDF",
      icon: "📄",
      color: "#FF3A5E",
      rotate: "rotate-1",
      href: "/extract-pages",
    },
    {
      title: "Organize PDF",
      description: "Rearrange pages in your document",
      icon: "📋",
      color: "#FFDE59",
      rotate: "-rotate-1",
      href: "/organize-pages",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFDE59] antialiased">
      {/* Header */}

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 pb-8 sm:pb-16">
        <div className="text-center">
        <div className="bg-white border-4 border-black p-4 sm:p-8 mb-8 sm:mb-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-1 relative">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-black mb-2 sm:mb-4 tracking-tight">
              PDFNinja: Swift PDF Mastery
            </h2>
            <p className="text-base sm:text-xl text-black mb-4 sm:mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
              Handle your PDFs with ninja-like precision. Fast, intuitive tools
              for all your document needs.
            </p>
            {/* <div className="flex justify-center gap-6">
              <button className="bg-[#FF3A5E] text-white px-8 py-4 border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                Get Started
              </button>
              <button className="bg-[#4DCCFF] text-black px-8 py-4 border-3 border-black font-bold hover:bg-[#7DDAFF] transition-all duration-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                Learn More
              </button>
            </div> */}
            <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 bg-[#4DCCFF] border-3 border-black p-2 sm:p-3 transform rotate-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:rotate-0 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-all duration-300">
              <span className="text-lg sm:text-2xl font-black">NEW!</span>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mt-8 sm:mt-16">
            {tools.map((tool, index) => (
              <Link
                href={tool.href}
                key={index}
                className={`bg-white border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] sm:hover:translate-x-[-4px] sm:hover:translate-y-[-4px] ${tool.rotate}`}              >
                <div className="flex items-start space-x-2 sm:space-x-4">
                  <div
                    className={`text-2xl sm:text-4xl p-2 sm:p-3 rounded-md shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:scale-110`}
                    style={{
                      backgroundColor: tool.color,
                      border: "3px solid black",
                    }}
                  >
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-black mb-1 sm:mb-2 tracking-tight transform hover:scale-105 transition-transform duration-300">
                      {tool.title}
                    </h3>
                    <p className="text-black text-sm sm:text-md leading-relaxed font-medium">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h4 className="text-xl sm:text-2xl font-black text-black mb-3 sm:mb-4 tracking-tight transform -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300">
                PDFNinja
              </h4>
              <p className="text-black text-sm sm:text-md leading-relaxed font-medium">
                Precision PDF tools for modern workflows
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-black uppercase tracking-wider mb-3 sm:mb-4 transform hover:scale-105 transition-transform duration-300">
                Tools
              </h4>
              <ul className="space-y-2 sm:space-y-3 text-black text-sm sm:text-md font-medium">
                <li>
                  <Link
                    href="/merge"
                    className="hover:text-[#FF3A5E] transition-colors duration-300 hover:underline hover:underline-offset-4 transform hover:scale-105"
                  >
                    Merge
                  </Link>
                </li>
                <li>
                  <Link
                    href="/split"
                    className="hover:text-[#FF3A5E] transition-colors duration-300 hover:underline hover:underline-offset-4 transform hover:scale-105"
                  >
                    Split
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compress"
                    className="hover:text-[#FF3A5E] transition-colors duration-300 hover:underline hover:underline-offset-4 transform hover:scale-105"
                  >
                    Compress
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-black uppercase tracking-wider mb-3 sm:mb-4 transform hover:scale-105 transition-transform duration-300">
                Company
              </h4>
              <ul className="space-y-2 sm:space-y-3 text-black text-sm sm:text-md font-medium">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-[#FF3A5E] transition-colors duration-300 hover:underline hover:underline-offset-4 transform hover:scale-105"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-[#FF3A5E] transition-colors duration-300 hover:underline hover:underline-offset-4 transform hover:scale-105"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-[#FF3A5E] transition-colors duration-300 hover:underline hover:underline-offset-4 transform hover:scale-105"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-black uppercase tracking-wider mb-3 sm:mb-4 transform hover:scale-105 transition-transform duration-300">
                Legal
              </h4>
              <ul className="space-y-2 sm:space-y-3 text-black text-sm sm:text-md font-medium">
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-[#FF3A5E] transition-colors duration-300 hover:underline hover:underline-offset-4 transform hover:scale-105"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-[#FF3A5E] transition-colors duration-300 hover:underline hover:underline-offset-4 transform hover:scale-105"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="hover:text-[#FF3A5E] transition-colors duration-300 hover:underline hover:underline-offset-4 transform hover:scale-105"
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-2 border-dashed border-black">
            <p className="text-center text-black text-sm sm:text-base font-medium">
              © {new Date().getFullYear()} PDFNinja. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
