import Link from "next/link";

export default function NeoBrutalismHome() {
  return (
    <div className="min-h-screen bg-[#FFDE59] antialiased">
      {/* Header */}

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="text-center">
          <div className="bg-white border-4 border-black p-8 mb-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-1 relative">
            <h2 className="text-5xl md:text-6xl font-black text-black mb-4 tracking-tight">
              PDFNinja: Swift PDF Mastery
            </h2>
            <p className="text-xl text-black mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
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
            <div className="absolute -top-6 -right-6 bg-[#4DCCFF] border-3 border-black p-3 transform rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-2xl font-black">NEW!</span>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {[
              {
                title: "Merge PDFs",
                description: "Combine multiple documents seamlessly",
                icon: "📑",
                color: "#FF3A5E",
                rotate: "rotate-2",
              },
              {
                title: "Split PDF",
                description: "Divide files with precision",
                icon: "✂️",
                color: "#4DCCFF",
                rotate: "-rotate-1",
              },
              {
                title: "Compress PDF",
                description: "Optimize file sizes effortlessly",
                icon: "🗜️",
                color: "#FFDE59",
                rotate: "rotate-1",
              },
              {
                title: "Convert Files",
                description: "Switch formats in a snap",
                icon: "🔄",
                color: "#4DCCFF",
                rotate: "-rotate-2",
              },
              {
                title: "Edit PDF",
                description: "Modify content with ease",
                icon: "✍️",
                color: "#FF3A5E",
                rotate: "rotate-1",
              },
              {
                title: "Secure PDF",
                description: "Add protection quickly",
                icon: "🔒",
                color: "#FFDE59",
                rotate: "-rotate-1",
              },
            ].map((tool, index) => (
              <div
                key={index}
                className={`bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] ${tool.rotate}`}
              >
                <div className="flex items-start space-x-4">
                  <span
                    className={`text-4xl p-3 bg-[${tool.color}] border-2 border-black rounded-md`}
                  >
                    {tool.icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-black mb-2 tracking-tight">
                      {tool.title}
                    </h3>
                    <p className="text-black text-md leading-relaxed font-medium">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-2xl font-black text-black mb-4 tracking-tight transform -rotate-2">
                PDFNinja
              </h4>
              <p className="text-black text-md leading-relaxed font-medium">
                Precision PDF tools for modern workflows
              </p>
            </div>
            <div>
              <h4 className="text-lg font-black text-black uppercase tracking-wider mb-4">
                Tools
              </h4>
              <ul className="space-y-3 text-black text-md font-medium">
                <li>
                  <Link
                    href="/merge"
                    className="hover:text-[#FF3A5E] transition-colors duration-200 hover:underline hover:underline-offset-4"
                  >
                    Merge
                  </Link>
                </li>
                <li>
                  <Link
                    href="/split"
                    className="hover:text-[#FF3A5E] transition-colors duration-200 hover:underline hover:underline-offset-4"
                  >
                    Split
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compress"
                    className="hover:text-[#FF3A5E] transition-colors duration-200 hover:underline hover:underline-offset-4"
                  >
                    Compress
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-black text-black uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-3 text-black text-md font-medium">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-[#FF3A5E] transition-colors duration-200 hover:underline hover:underline-offset-4"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-[#FF3A5E] transition-colors duration-200 hover:underline hover:underline-offset-4"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-[#FF3A5E] transition-colors duration-200 hover:underline hover:underline-offset-4"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-black text-black uppercase tracking-wider mb-4">
                Legal
              </h4>
              <ul className="space-y-3 text-black text-md font-medium">
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-[#FF3A5E] transition-colors duration-200 hover:underline hover:underline-offset-4"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-[#FF3A5E] transition-colors duration-200 hover:underline hover:underline-offset-4"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="hover:text-[#FF3A5E] transition-colors duration-200 hover:underline hover:underline-offset-4"
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t-2 border-dashed border-black">
            <p className="text-center text-black font-medium">
              © {new Date().getFullYear()} PDFNinja. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
