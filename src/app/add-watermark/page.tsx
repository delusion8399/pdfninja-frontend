"use client";

import React, { useState, useRef } from "react";
import { Document, Page as PdfPage, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { config } from "@/config";

// Set up PDF.js worker to use local worker file
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFFile {
  id: string;
  name: string;
  file: File;
  url: string;
  size: number;
  numPages?: number;
  watermarkedUrl?: string;
}

interface WatermarkOptions {
  type: "text" | "image";
  text?: string;
  textColor?: string;
  fontSize?: number;
  opacity?: number;
  position?: string;
  rotation?: number;
  image?: File;
  imageUrl?: string;
  scale?: number;
  // Grid position (0-8) for 3x3 grid
  // 0 1 2
  // 3 4 5
  // 6 7 8
  gridPosition?: number;
}

export default function Page() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  const [watermarkOptions, setWatermarkOptions] = useState<WatermarkOptions>({
    type: "text",
    text: "CONFIDENTIAL",
    textColor: "#FF3A5E",
    fontSize: 48,
    opacity: 0.5,
    position: "center",
    rotation: 45,
    scale: 0.5,
    gridPosition: 4, // Center position in the 3x3 grid
  });
  const imageInputRef = useRef<HTMLInputElement>(null);

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
    setCurrentPage(1);
    setError(null);
  };

  const handleWatermarkImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const imageUrl = URL.createObjectURL(selectedFile);

    setWatermarkOptions({
      ...watermarkOptions,
      image: selectedFile,
      imageUrl: imageUrl,
    });
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    if (file) {
      setFile({ ...file, numPages });
    }
  };

  const onDocumentLoadError = (err: Error) => {
    console.error("Error loading PDF:", err);
    setError("Failed to load PDF. Please try again.");
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (file && currentPage < (file.numPages || 1)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleWatermarkTypeChange = (type: "text" | "image") => {
    setWatermarkType(type);
    setWatermarkOptions({
      ...watermarkOptions,
      type,
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWatermarkOptions({
      ...watermarkOptions,
      text: e.target.value,
    });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWatermarkOptions({
      ...watermarkOptions,
      textColor: e.target.value,
    });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWatermarkOptions({
      ...watermarkOptions,
      fontSize: parseInt(e.target.value),
    });
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWatermarkOptions({
      ...watermarkOptions,
      opacity: parseFloat(e.target.value),
    });
  };


  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWatermarkOptions({
      ...watermarkOptions,
      rotation: parseInt(e.target.value),
    });
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWatermarkOptions({
      ...watermarkOptions,
      scale: parseFloat(e.target.value),
    });
  };

  const handleGridPositionChange = (position: number) => {
    // Map grid position to position string
    let positionString = "center";
    switch (position) {
      case 0: positionString = "top-left"; break;
      case 1: positionString = "top"; break;
      case 2: positionString = "top-right"; break;
      case 3: positionString = "left"; break;
      case 4: positionString = "center"; break;
      case 5: positionString = "right"; break;
      case 6: positionString = "bottom-left"; break;
      case 7: positionString = "bottom"; break;
      case 8: positionString = "bottom-right"; break;
      default: positionString = "center";
    }

    setWatermarkOptions({
      ...watermarkOptions,
      gridPosition: position,
      position: positionString,
    });
  };

  const handleApplyWatermark = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Prepare form data for API request
      const formData = new FormData();
      formData.append("pdf", file.file);
      formData.append("type", watermarkOptions.type);

      if (watermarkOptions.type === "text") {
        formData.append("text", watermarkOptions.text || "");
        formData.append("textColor", watermarkOptions.textColor || "#000000");
        formData.append("fontSize", watermarkOptions.fontSize?.toString() || "48");
      } else if (watermarkOptions.type === "image" && watermarkOptions.image) {
        formData.append("image", watermarkOptions.image);
      }

      formData.append("opacity", watermarkOptions.opacity?.toString() || "0.5");
      formData.append("position", watermarkOptions.position || "center");
      formData.append("gridPosition", watermarkOptions.gridPosition?.toString() || "4");
      formData.append("rotation", watermarkOptions.rotation?.toString() || "0");
      formData.append("scale", watermarkOptions.scale?.toString() || "0.5");

      // Make API request to add watermark to PDF
      // Note: This endpoint doesn't exist yet in the backend
      const response = await fetch(`${config.apiBaseUrl}/pdf/watermark`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // Get the watermarked PDF as a blob
      const blob = await response.blob();
      const watermarkedUrl = URL.createObjectURL(blob);

      // Update the file state with the watermarked PDF URL
      setFile({
        ...file,
        watermarkedUrl,
      });
    } catch (err) {
      console.error("Error applying watermark:", err);
      setError(err instanceof Error ? err.message : "Failed to apply watermark");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!file || !file.watermarkedUrl) return;

    const link = document.createElement("a");
    link.href = file.watermarkedUrl;
    link.download = `watermarked_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#4DCCFF] antialiased">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex-1 relative">
          {!file && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-1 relative max-w-2xl w-full text-center">
                <h2 className="text-4xl font-black text-black mb-4 tracking-tight">
                  Add Watermark to PDF
                </h2>
                <p className="text-xl text-black mb-8 font-medium">
                  Add text or image watermarks to your PDF documents with customizable position, opacity, and rotation.
                </p>
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer bg-[#FFDE59] text-black px-6 py-3 border-3 border-black font-bold hover:bg-[#FFE47A] transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] inline-block transform hover:scale-105"
                >
                  Choose PDF File
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {file && (
            <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-8 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* PDF Preview */}
                <div className="border-3 border-black p-4">
                  <h3 className="text-xl font-bold mb-4 text-black">
                    PDF Preview
                  </h3>
                  <div className="flex justify-center items-center bg-gray-100 border-2 border-black min-h-[400px] relative">
                    {/* Grid overlay */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                      <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((position) => (
                          <div
                            key={position}
                            className={`border border-dashed ${watermarkOptions.gridPosition === position ? 'border-[#FF3A5E]' : 'border-gray-300'} flex items-center justify-center`}
                          >
                            {watermarkOptions.gridPosition === position && (
                              <div className="relative">
                                {watermarkType === 'text' && (
                                  <div
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none"
                                    style={{
                                      color: watermarkOptions.textColor,
                                      fontSize: `${Math.min(watermarkOptions.fontSize || 48, 24)}px`,
                                      transform: `translate(-50%, -50%) rotate(${watermarkOptions.rotation}deg)`,
                                      opacity: watermarkOptions.opacity,
                                    }}
                                  >
                                    {watermarkOptions.text}
                                  </div>
                                )}
                                {watermarkType === 'image' && watermarkOptions.imageUrl && (
                                  <div
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none"
                                    style={{
                                      transform: `translate(-50%, -50%) rotate(${watermarkOptions.rotation}deg)`,
                                      opacity: watermarkOptions.opacity,
                                    }}
                                  >
                                    <img
                                      src={watermarkOptions.imageUrl}
                                      alt="Watermark preview"
                                      className="max-w-[50px] max-h-[50px] object-contain"
                                      style={{
                                        transform: `scale(${watermarkOptions.scale || 0.5})`,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Document
                      file={file.watermarkedUrl || file.url}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex items-center justify-center h-full w-full">
                          <div className="text-black font-bold">Loading...</div>
                        </div>
                      }
                    >
                      <PdfPage
                        pageNumber={currentPage}
                        width={300}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage <= 1}
                      className={`px-4 py-2 border-2 border-black font-bold transition-all duration-200 ${
                        currentPage <= 1
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-[#FFDE59] text-black hover:bg-[#FFE47A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                      }`}
                    >
                      Previous
                    </button>
                    <span className="font-bold">
                      Page {currentPage} of {file.numPages || 1}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={!file.numPages || currentPage >= file.numPages}
                      className={`px-4 py-2 border-2 border-black font-bold transition-all duration-200 ${
                        !file.numPages || currentPage >= file.numPages
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-[#FFDE59] text-black hover:bg-[#FFE47A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Watermark Options */}
                <div className="border-3 border-black p-4">
                  <h3 className="text-xl font-bold mb-4 text-black">
                    Watermark Options
                  </h3>

                  {/* Watermark Type Selection */}
                  <div className="mb-4">
                    <div className="flex space-x-4 mb-4">
                      <button
                        onClick={() => handleWatermarkTypeChange("text")}
                        className={`px-4 py-2 border-2 border-black font-bold transition-all duration-200 ${
                          watermarkType === "text"
                            ? "bg-[#FF3A5E] text-white"
                            : "bg-white text-black hover:bg-[#FFDE59]"
                        } shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                      >
                        Text Watermark
                      </button>
                      <button
                        onClick={() => handleWatermarkTypeChange("image")}
                        className={`px-4 py-2 border-2 border-black font-bold transition-all duration-200 ${
                          watermarkType === "image"
                            ? "bg-[#FF3A5E] text-white"
                            : "bg-white text-black hover:bg-[#FFDE59]"
                        } shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                      >
                        Image Watermark
                      </button>
                    </div>

                    {/* Text Watermark Options */}
                    {watermarkType === "text" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-black font-bold mb-2">
                            Watermark Text
                          </label>
                          <input
                            type="text"
                            value={watermarkOptions.text || ""}
                            onChange={handleTextChange}
                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FF3A5E]"
                            placeholder="Enter watermark text"
                          />
                        </div>
                        <div>
                          <label className="block text-black font-bold mb-2">
                            Text Color
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={watermarkOptions.textColor || "#FF3A5E"}
                              onChange={handleColorChange}
                              className="w-10 h-10 border-2 border-black cursor-pointer"
                            />
                            <span className="text-black">
                              {watermarkOptions.textColor}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-black font-bold mb-2">
                            Font Size: {watermarkOptions.fontSize}
                          </label>
                          <input
                            type="range"
                            min="12"
                            max="144"
                            step="1"
                            value={watermarkOptions.fontSize || 48}
                            onChange={handleFontSizeChange}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}

                    {/* Image Watermark Options */}
                    {watermarkType === "image" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-black font-bold mb-2">
                            Watermark Image
                          </label>
                          <div className="flex flex-col space-y-2">
                            <label
                              htmlFor="image-upload"
                              className="cursor-pointer bg-[#FFDE59] text-black px-4 py-2 border-2 border-black font-bold hover:bg-[#FFE47A] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] inline-block text-center"
                            >
                              Choose Image
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleWatermarkImageChange}
                                className="hidden"
                                ref={imageInputRef}
                              />
                            </label>
                            {watermarkOptions.imageUrl && (
                              <div className="mt-2 border-2 border-black p-2">
                                <img
                                  src={watermarkOptions.imageUrl}
                                  alt="Watermark preview"
                                  className="max-h-32 max-w-full object-contain mx-auto"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-black font-bold mb-2">
                            Scale: {watermarkOptions.scale?.toFixed(1)}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.1"
                            value={watermarkOptions.scale || 0.5}
                            onChange={handleScaleChange}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}

                    {/* Common Options */}
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-black font-bold mb-2">
                          Opacity: {watermarkOptions.opacity?.toFixed(1)}
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.1"
                          value={watermarkOptions.opacity || 0.5}
                          onChange={handleOpacityChange}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-black font-bold mb-2">
                          Position
                        </label>
                        <div className="flex justify-center">
                          <div className="inline-grid grid-cols-3 gap-1 border-2 border-black p-2 bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((position) => (
                              <button
                                key={position}
                                type="button"
                                onClick={() => handleGridPositionChange(position)}
                                className={`w-[30px] h-[30px] border ${watermarkOptions.gridPosition === position
                                  ? 'border-[#FF3A5E] bg-[#FF3A5E] text-white'
                                  : 'border-black bg-white hover:bg-[#FFDE59]'}
                                  flex items-center justify-center transition-all duration-200`}
                                aria-label={`Position ${position}`}
                              >
                                {position === 4 && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                )}
                                {position !== 4 && (
                                  <div className="w-1.5 h-1.5 rounded-full border border-current"></div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 text-center">
                          {watermarkOptions.position}
                        </div>
                      </div>
                      <div>
                        <label className="block text-black font-bold mb-2">
                          Rotation: {watermarkOptions.rotation}°
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="5"
                          value={watermarkOptions.rotation || 0}
                          onChange={handleRotationChange}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Apply Watermark Button */}
                  <div className="mt-6">
                    <button
                      onClick={handleApplyWatermark}
                      disabled={isProcessing}
                      className="w-full bg-[#FF3A5E] text-white px-6 py-3 border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? "Processing..." : "Apply Watermark"}
                    </button>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-100 border-2 border-red-500 text-red-700">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Results Section */}
              {file.watermarkedUrl && (
                <div className="mt-8 border-3 border-black p-4 bg-[#FFDE59] transform rotate-1">
                  <h3 className="text-xl font-bold mb-4 text-black">
                    Watermarked PDF Ready!
                  </h3>
                  <div className="flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="px-8 py-4 bg-[#FF3A5E] text-white border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transform hover:scale-105"
                    >
                      Download Watermarked PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
