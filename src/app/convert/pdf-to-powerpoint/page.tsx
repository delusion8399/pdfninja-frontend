"use client";

import React, { useState } from "react";
import { config } from "@/config";

interface ConvertFile {
  id: string;
  name: string;
  file: File;
  url: string;
  size: number;
  convertedUrl?: string;
  convertedSize?: number;
}

export default function Page() {
  const [file, setFile] = useState<ConvertFile | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.match(/application\/pdf/)) {
      setError("Please select a PDF file");
      return;
    }

    const fileObj: ConvertFile = {
      id: `${selectedFile.name}-${Date.now()}`,
      name: selectedFile.name,
      file: selectedFile,
      url: URL.createObjectURL(selectedFile),
      size: selectedFile.size,
    };

    setFile(fileObj);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file.file);
      formData.append("format", "pptx");

      const response = await fetch(`${config.apiBaseUrl}/pdf/convert/pdf-to-powerpoint`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to convert file");
      }

      const blob = await response.blob();
      const convertedUrl = URL.createObjectURL(blob);
      
      setFile({
        ...file,
        convertedUrl,
        convertedSize: blob.size,
      });
    } catch (err) {
      console.error("Error converting file:", err);
      setError(err instanceof Error ? err.message : "Failed to convert file");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!file?.convertedUrl) return;

    const link = document.createElement("a");
    link.href = file.convertedUrl;
    link.download = `${file.name.replace(/\.[^/.]+$/, "")}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cleanup URLs when component unmounts or file changes
  React.useEffect(() => {
    return () => {
      if (file) {
        URL.revokeObjectURL(file.url);
        if (file.convertedUrl) {
          URL.revokeObjectURL(file.convertedUrl);
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

  return (
    <div className="min-h-screen bg-[#FFDE59] antialiased">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight transform rotate-1">
            PDF to PowerPoint Converter
          </h1>
          <p className="text-xl text-black mb-6 max-w-3xl mx-auto leading-relaxed font-medium">
            Convert your PDF documents to PowerPoint format with high quality and ease.
          </p>
        </div>

        {/* File Upload Section */}
        {!file && (
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 transform rotate-1">
            <div className="flex flex-col items-center justify-center">
              <label
                htmlFor="file-upload"
                className="w-full max-w-xl h-64 flex flex-col items-center justify-center border-3 border-dashed border-black rounded-none cursor-pointer bg-[#4DCCFF] hover:bg-[#7DDAFF] transition-colors duration-200 relative p-6"
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="text-center">
                  <p className="text-2xl font-bold mb-2 text-black">Drop your PDF here</p>
                  <p className="text-lg text-black">or click to browse</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* File Info and Conversion Section */}
        {file && (
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 transform rotate-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Selected File</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-black">{file.name}</p>
                  <p className="text-black">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  Remove
                </button>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={isConverting}
              className={`w-full py-4 px-6 text-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black ${
                isConverting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#4DCCFF] hover:bg-[#7DDAFF] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              }`}
            >
              {isConverting ? "Converting..." : "Convert to PowerPoint"}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-100 text-black border-2 border-red-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Preview and Download Section */}
        {file?.convertedUrl && (
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
            <h2 className="text-2xl font-bold mb-4 text-black">Converted Document</h2>
            <div className="border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium text-black">PowerPoint Presentation</p>
                  <p className="text-black">{formatFileSize(file.convertedSize || 0)}</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-[#4DCCFF] hover:bg-[#7DDAFF] text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 