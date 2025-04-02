"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import React, { useCallback, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Tooltip } from "react-tooltip";
import { config } from "../../config";

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
  numPages?: number;
}

export default function MergePage() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).map(
      (file: File, index: number) => ({
        id: `${index}-${file.name}-${Date.now()}`,
        name: file.name,
        file,
        url: URL.createObjectURL(file),
      })
    );
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const finishIndex = result.destination.index;

    setFiles((currentFiles) => {
      const reorderedFiles = Array.from(currentFiles);
      const [movedItem] = reorderedFiles.splice(startIndex, 1);
      reorderedFiles.splice(finishIndex, 0, movedItem);
      return reorderedFiles;
    });
  }, []);

  const handleMerge = async () => {
    if (files.length < 2) {
      alert("Please select at least two PDFs to merge.");
      return;
    }

    setIsMerging(true);
    const formData = new FormData();
    files.forEach((fileObj) => {
      formData.append("pdfs", fileObj.file);
    });

    try {
      const response = await fetch(`${config.apiBaseUrl}/pdf/merge`, {
        method: "POST",
        body: formData,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Merge failed");
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "merged.pdf"; // Default filename
      if (contentDisposition) {
        // Updated regex to handle both quoted and unquoted filenames
        const matches = /filename=(?:"([^"]+)"|([^;]+))/.exec(
          contentDisposition
        );
        if (matches && (matches[1] || matches[2])) {
          filename = matches[1] || matches[2];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to merge PDFs. Please try again."
      );
    } finally {
      setIsMerging(false);
    }
  };

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.url));
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFDE59] antialiased">
      <main className="flex-1 flex flex-col md:flex-row p-6">
        <div className="flex-1 relative">
          {files.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-1 relative max-w-2xl w-full text-center">
                <h2 className="text-4xl font-black text-black mb-4 tracking-tight">
                  Merge PDF Files
                </h2>
                <p className="text-xl text-black mb-8 font-medium">
                  Combine PDFs in the order you want with the easiest PDF merger
                  available.
                </p>
                <label
                  htmlFor="pdf-upload"
                  className="bg-[#FF3A5E] text-white px-8 py-4 border-3 border-black font-bold cursor-pointer hover:bg-[#FF6B87] transition-all duration-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] inline-block"
                >
                  Select PDF files
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="text-black mt-4 font-bold">or drop PDFs here</p>
                <div className="absolute -top-6 -right-6 bg-[#4DCCFF] border-3 border-black p-3 transform rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xl font-black">DRAG & DROP</span>
                </div>
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="relative p-4">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="pdf-list" direction="horizontal">
                  {(provided) => (
                    <div
                      className="flex flex-wrap justify-center gap-6 mb-8 px-4 max-w-[1400px] mx-auto"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {files.map((file, index) => (
                        <Draggable
                          key={file.id}
                          draggableId={file.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <NeoBrutalismPDFCard file={file} index={index} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <label
                htmlFor="pdf-upload-more"
                className="absolute top-4 right-4 bg-[#FF3A5E] text-white w-16 h-16 flex items-center justify-center rounded-full border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-[#FF6B87] transition-all duration-200 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
              >
                <span className="text-2xl font-black">+</span>
                <span className="absolute -top-2 -right-2 bg-[#4DCCFF] text-black text-sm font-black rounded-full w-8 h-8 flex items-center justify-center border-2 border-black">
                  {files.length}
                </span>
                <input
                  id="pdf-upload-more"
                  type="file"
                  accept=".pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="w-full md:w-80 md:border-l-4 md:border-black flex flex-col mt-8 md:mt-0">
            <div className="p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] m-4">
              <h3 className="text-3xl font-black text-black capitalize mb-6 transform -rotate-2">
                Merge PDF
              </h3>
              <div className="bg-[#4DCCFF] p-4 border-3 border-black text-black text-md font-medium mb-8">
                <p>
                  To change the order of your PDFs, drag and drop the files as
                  you want.
                </p>
              </div>
              <button
                onClick={handleMerge}
                disabled={isMerging || files.length < 2}
                className={`w-full bg-[#FF3A5E] text-white px-4 py-3 border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] flex items-center justify-center ${
                  isMerging || files.length < 2
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isMerging ? "Merging..." : "Merge PDF"}
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* How It Works Section (Copied from compress, text adapted for merge) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 transform rotate-1">
          <h2 className="text-3xl font-black text-black mb-6 tracking-tight transform -rotate-1">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[#4DCCFF] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                1
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">
                Upload Your PDFs
              </h3>
              <p className="text-black">
                Select the PDF files you want to combine from your device.
              </p>
            </div>
            {/* Step 2 */}
            <div className="bg-[#FFDE59] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                2
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">
                Reorder Files (Optional)
              </h3>
              <p className="text-black">
                Drag and drop the files to arrange them in the desired order.
              </p>
            </div>
            {/* Step 3 */}
            <div className="bg-[#FF3A5E] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                3
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">
                Download Merged File
              </h3>
              <p className="text-black">
                Get your single, combined PDF document.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer (Ensure Footer exists or add one if necessary) */}
      {/* Assuming a similar footer structure exists or should be added */}
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
            {/* Add navigation links if needed */}
          </div>
        </div>
      </footer>
    </div>
  );
}

const NeoBrutalismPDFCard = React.memo(function NeoBrutalismPDFCard({
  file,
  index,
}: {
  file: PDFFile;
  index: number;
}) {
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const rotations = ["rotate-2", "-rotate-1", "rotate-1", "-rotate-2"];
  const rotation = rotations[index % rotations.length];

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error("Error loading PDF:", err);
    setError(err.message);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <>
      <div
        id={`pdf-card-${file.id}`}
        data-tooltip-id={`tooltip-${file.id}`}
        className={`group relative bg-white border-4 border-black overflow-hidden transition-all duration-200 w-[200px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] ${rotation}`}
      >
        <div className="aspect-[1/1.414] w-full relative p-2">
          {file?.url && (
            <Document
              file={file.url}
              key={`${file.url}-${Date.now()}`}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border-2 border-black">
                  <div className="text-black font-bold">Loading...</div>
                </div>
              }
              error={
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 border-2 border-black">
                  <div className="text-black font-bold">
                    {error || "Error loading PDF"}
                  </div>
                </div>
              }
              className="absolute inset-0 flex items-center justify-center"
            >
              <Page
                pageNumber={1}
                width={192}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="!w-full !h-full object-contain"
              />
            </Document>
          )}{" "}
        </div>
        <div className="border-t-4 border-black p-2 text-center bg-[#4DCCFF]">
          <p className="text-sm text-black font-bold truncate px-2">
            {file.name}
          </p>
        </div>
      </div>

      <Tooltip
        id={`tooltip-${file.id}`}
        place="top"
        className="z-[1000] !bg-white !text-black !text-sm !rounded-none !py-2 !px-3 !border-3 !border-black !shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="space-y-1">
          <div>
            <span className="font-black">Name:</span> {file.name}
          </div>
          <div>
            <span className="font-black">Size:</span>{" "}
            {formatFileSize(file.file.size)}
          </div>
          <div>
            <span className="font-black">Pages:</span>{" "}
            {numPages || "Loading..."}
          </div>
        </div>
      </Tooltip>
    </>
  );
});
