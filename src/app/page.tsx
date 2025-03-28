import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 antialiased">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
              PDFNinja
            </h1>
            <nav className="flex items-center space-x-6">
              <Link
                href="/merge"
                className="text-gray-700 hover:text-[#971E4C] transition-colors duration-200"
              >
                Merge PDF
              </Link>
              <Link
                href="/login"
                className="text-gray-700 hover:text-[#971E4C] transition-colors duration-200"
              >
                Login
              </Link>
              <button className="bg-[#971E4C] text-white px-4 py-2 rounded-md font-medium hover:bg-[#7A173C] transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#971E4C] focus:ring-offset-2">
                Sign Up
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            PDFNinja: Swift PDF Mastery
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Handle your PDFs with ninja-like precision. Fast, intuitive tools
            for all your document needs.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-[#971E4C] text-white px-6 py-3 rounded-md font-medium hover:bg-[#7A173C] transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#971E4C] focus:ring-offset-2">
              Get Started
            </button>
            <button className="bg-transparent text-[#971E4C] px-6 py-3 rounded-md font-medium border border-[#971E4C] hover:bg-[#971E4C]/10 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#971E4C] focus:ring-offset-2">
              Learn More
            </button>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {[
            {
              title: "Merge PDFs",
              description: "Combine multiple documents seamlessly",
              icon: "📑",
              color: "red", // Using Tailwind's red to complement #971E4C
            },
            {
              title: "Split PDF",
              description: "Divide files with precision",
              icon: "✂️",
              color: "red",
            },
            {
              title: "Compress PDF",
              description: "Optimize file sizes effortlessly",
              icon: "🗜️",
              color: "red",
            },
            {
              title: "Convert Files",
              description: "Switch formats in a snap",
              icon: "🔄",
              color: "red",
            },
            {
              title: "Edit PDF",
              description: "Modify content with ease",
              icon: "✍️",
              color: "red",
            },
            {
              title: "Secure PDF",
              description: "Add protection quickly",
              icon: "🔒",
              color: "red",
            },
          ].map((tool, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer group flex items-start space-x-4"
            >
              <span
                className={`text-3xl p-2 bg-${tool.color}-100 rounded-md text-[#971E4C] group-hover:bg-[#971E4C]/20 transition-colors duration-200`}
              >
                {tool.icon}
              </span>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1 tracking-tight">
                  {tool.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 tracking-tight">
                PDFNinja
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Precision PDF tools for modern workflows
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4">
                Tools
              </h4>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li>
                  <Link
                    href="/merge"
                    className="hover:text-[#971E4C] transition-colors duration-200"
                  >
                    Merge
                  </Link>
                </li>
                <li>
                  <Link
                    href="/split"
                    className="hover:text-[#971E4C] transition-colors duration-200"
                  >
                    Split
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compress"
                    className="hover:text-[#971E4C] transition-colors duration-200"
                  >
                    Compress
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-[#971E4C] transition-colors duration-200"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-[#971E4C] transition-colors duration-200"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-[#971E4C] transition-colors duration-200"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4">
                Legal
              </h4>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-[#971E4C] transition-colors duration-200"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-[#971E4C] transition-colors duration-200"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            © 2025 PDFNinja. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
