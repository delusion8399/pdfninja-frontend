"use client";

import Link from "next/link";
import * as pdfjsLib from "pdfjs-dist";
import React, { useCallback, useEffect, useRef, useState } from "react";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@5.0.375/build/pdf.worker.min.mjs";

interface PDFFile {
  id: string;
  name: string;
  file: File;
  url: string;
  size: number;
  compressedUrl?: string;
  compressedSize?: number;
}

export default function Page() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<string>("medium");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileObj: PDFFile = {
      id: `${selectedFile.name}-${Date.now()}`,
      name: selectedFile.name,
      file: selectedFile,
      url: URL.createObjectURL(selectedFile),
      size: selectedFile.size,
    };

    setFile(fileObj);
  };

  const renderPreview = useCallback(async () => {
    if (!file || !canvasRef.current) return;

    try {
      const loadingTask = pdfjsLib.getDocument(file.url);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
    } catch (error) {
      console.error("Error rendering PDF preview:", error);
    }
  }, [file]);

  useEffect(() => {
    if (file) {
      renderPreview();
    }
  }, [file, renderPreview]);

  useEffect(() => {
    return () => {
      if (file) {
        URL.revokeObjectURL(file.url);
        if (file.compressedUrl) {
          URL.revokeObjectURL(file.compressedUrl);
        }
      }
    };
  }, [file]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleCompress = async () => {
    if (!file) {
      alert("Please select a PDF to compress.");
      return;
    }

    setIsCompressing(true);
    const formData = new FormData();
    formData.append("pdf", file.file);
    formData.append("compressionLevel", compressionLevel);

    try {
      // This is a placeholder for the actual API call
      // In a real implementation, you would call your backend API
      // For now, we'll simulate compression with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate a compressed file (in reality, this would come from the API)
      const compressedSize = Math.floor(
        file.size *
          (compressionLevel === "low"
            ? 0.8
            : compressionLevel === "medium"
            ? 0.6
            : 0.4)
      );

      setFile({
        ...file,
        compressedUrl: file.url, // In a real implementation, this would be the URL of the compressed file
        compressedSize: compressedSize,
      });

      // In a real implementation, you would download the compressed file
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement("a");
      // link.href = url;
      // link.download = `compressed_${file.name}`;
      // link.click();
      // window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error compressing PDF:", error);
      alert("Failed to compress PDF. Please try again.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!file || !file.compressedUrl) return;

    const link = document.createElement("a");
    link.href = file.compressedUrl;
    link.download = `compressed_${file.name}`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#FFDE59] antialiased">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight transform rotate-1">
            Compress PDF Files
          </h1>
          <p className="text-xl text-black mb-6 max-w-3xl mx-auto leading-relaxed font-medium">
            Reduce your PDF file size without losing quality. Perfect for
            sharing via email or saving storage space.
          </p>
        </div>

        {/* File Upload Section */}
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 transform rotate-1">
          <div className="flex flex-col items-center justify-center">
            <label
              htmlFor="file-upload"
              className="w-full max-w-xl h-64 flex flex-col items-center justify-center border-3 border-dashed border-black rounded-none cursor-pointer bg-[#4DCCFF] hover:bg-[#7DDAFF] transition-colors duration-200 relative p-6"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-12 h-12 mb-4 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <p className="mb-2 text-xl font-bold text-black">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm font-medium text-black">
                  PDF file (MAX. 100MB)
                </p>
              </div>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isCompressing}
              />
            </label>

            {/* Compression Options */}
            <div className="w-full max-w-xl mt-8">
              <h3 className="text-xl font-bold mb-4 text-black">
                Compression Level
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setCompressionLevel("low")}
                  className={`p-4 border-3 border-black font-bold transition-all duration-200 ${
                    compressionLevel === "low"
                      ? "bg-[#FF3A5E] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-black hover:bg-[#FFDE59]"
                  }`}
                >
                  Low
                  <span className="block text-sm mt-1">Better Quality</span>
                </button>
                <button
                  onClick={() => setCompressionLevel("medium")}
                  className={`p-4 border-3 border-black font-bold transition-all duration-200 ${
                    compressionLevel === "medium"
                      ? "bg-[#FF3A5E] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-black hover:bg-[#FFDE59]"
                  }`}
                >
                  Medium
                  <span className="block text-sm mt-1">Balanced</span>
                </button>
                <button
                  onClick={() => setCompressionLevel("high")}
                  className={`p-4 border-3 border-black font-bold transition-all duration-200 ${
                    compressionLevel === "high"
                      ? "bg-[#FF3A5E] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-black hover:bg-[#FFDE59]"
                  }`}
                >
                  High
                  <span className="block text-sm mt-1">Smaller Size</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview and Compress Section */}
        {file && (
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 transform -rotate-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PDF Preview */}
              <div className="border-3 border-black p-4">
                <h3 className="text-xl font-bold mb-4 text-black">Preview</h3>
                <div className="flex justify-center items-center bg-gray-100 border-2 border-black">
                  <canvas ref={canvasRef} className="max-w-full" />
                </div>
                <div className="mt-4">
                  <p className="font-bold text-black">{file.name}</p>
                  <p className="text-black">
                    Original Size: {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              {/* Compression Results */}
              <div className="border-3 border-black p-4">
                <h3 className="text-xl font-bold mb-4 text-black">
                  Compression Results
                </h3>
                {file.compressedSize ? (
                  <div className="space-y-4">
                    <div className="bg-[#FFDE59] border-2 border-black p-4">
                      <p className="font-bold text-black">
                        Original Size: {formatFileSize(file.size)}
                      </p>
                      <p className="font-bold text-black">
                        Compressed Size: {formatFileSize(file.compressedSize)}
                      </p>
                      <p className="font-bold text-black">
                        Reduction:{" "}
                        {Math.round(
                          (1 - file.compressedSize / file.size) * 100
                        )}
                        %
                      </p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="w-full bg-[#FF3A5E] text-white px-6 py-3 border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    >
                      Download Compressed PDF
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-black mb-6">
                      Click the button below to compress your PDF
                    </p>
                    <button
                      onClick={handleCompress}
                      disabled={isCompressing}
                      className="w-full bg-[#FF3A5E] text-white px-6 py-3 border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCompressing ? "Compressing..." : "Compress PDF"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 transform rotate-1">
          <h2 className="text-3xl font-black text-black mb-6 tracking-tight transform -rotate-1">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#4DCCFF] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                1
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">
                Upload Your PDF
              </h3>
              <p className="text-black">
                Select the PDF file you want to compress from your device.
              </p>
            </div>
            <div className="bg-[#FFDE59] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                2
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">
                Choose Compression Level
              </h3>
              <p className="text-black">
                Select your preferred compression level based on your needs.
              </p>
            </div>
            <div className="bg-[#FF3A5E] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                3
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">
                Download Compressed File
              </h3>
              <p className="text-black">
                Get your optimized PDF with reduced file size ready to share.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-xl font-black text-black transform -rotate-2">
                PDFNinja
              </p>
              <p className="text-sm text-black">
                © {new Date().getFullYear()} PDFNinja. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/" className="text-black hover:text-[#FF3A5E]">
                Privacy Policy
              </Link>
              <Link href="/" className="text-black hover:text-[#FF3A5E]">
                Terms of Service
              </Link>
              <Link href="/" className="text-black hover:text-[#FF3A5E]">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
