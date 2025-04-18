"use client";

import React, { useState } from "react";
import { config } from "@/config";

interface ConvertFile {
  id: string;
  name: string;
  file: File;
  url: string;
  size: number;
  convertedBlob?: Blob;
  isConverted?: boolean;
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
      formData.append("format", "jpg");

      const response = await fetch(`${config.apiBaseUrl}/pdf/convert/pdf-to-jpg`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to convert file");
      }

      // Get the ZIP file as a blob
      const blob = await response.blob();

      // Update file state with the converted blob
      setFile({
        ...file,
        convertedBlob: blob,
        isConverted: true
      });

      // Show success message
      setError("Conversion successful! Your PDF has been converted to JPG images.");
    } catch (err) {
      console.error("Error converting file:", err);
      setError(err instanceof Error ? err.message : "Failed to convert file");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadZip = () => {
    if (!file?.convertedBlob) return;

    // Create a URL for the blob
    const url = URL.createObjectURL(file.convertedBlob);

    // Create a link element to trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file.name.replace(/\.pdf$/i, "")}_images.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke the URL to free up memory
    URL.revokeObjectURL(url);
  };

  // Cleanup URLs when component unmounts or file changes
  React.useEffect(() => {
    return () => {
      if (file) {
        URL.revokeObjectURL(file.url);
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
            PDF to JPG Converter
          </h1>
          <p className="text-xl text-black mb-6 max-w-3xl mx-auto leading-relaxed font-medium">
            Convert your PDF pages to JPG images with high quality and ease.
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
              {isConverting ? "Converting..." : "Convert to JPG"}
            </button>

            {error && (
              <div className={`mt-4 p-4 ${error.includes("Conversion successful") ? "bg-green-100 border-green-700" : "bg-red-100 border-red-700"} text-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                {error.includes("Conversion successful") ? (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Download Section */}
        {file?.isConverted && (
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1 mt-8">
            <h2 className="text-3xl font-black mb-4 text-black tracking-tight">Download File</h2>
            <p className="text-lg mb-6 text-black font-medium">Your PDF has been successfully converted to JPG images and packaged as a ZIP file.</p>

            <div className="flex items-center justify-between mb-4 p-4 border-2 border-black bg-gray-100">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="font-bold text-black">{file.name.replace(/\.pdf$/i, "")}_images.zip</p>
                  <p className="text-sm text-black">{file.convertedBlob ? formatFileSize(file.convertedBlob.size) : ""}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadZip}
              className="w-full py-4 px-6 text-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black bg-[#4DCCFF] hover:bg-[#7DDAFF] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download ZIP File
            </button>
          </div>
        )}
      </main>
    </div>
  );
}