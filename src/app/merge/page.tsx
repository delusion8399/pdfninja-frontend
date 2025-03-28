"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { SpecialZoomLevel, Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

// Set up the pdf.js worker from a stable CDN

// Define TypeScript interface for file object
interface PDFFile {
  id: string;
  name: string;
  file: File;
  url: string;
  numPages?: number; // Optional, populated after loading
}

export default function MergePage() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).map(
      (file: File, index: number) => ({
        id: `${index}-${file.name}-${Date.now()}`, // Unique ID to prevent conflicts
        name: file.name,
        file,
        url: URL.createObjectURL(file),
      }),
    );
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  // Handle drag and drop reordering
  const onDragEnd = useCallback((result: any) => {
    if (!result.destination) return; // Dropped outside the list

    const startIndex = result.source.index;
    const finishIndex = result.destination.index;

    setFiles((currentFiles) => {
      const reorderedFiles = Array.from(currentFiles);
      const [movedItem] = reorderedFiles.splice(startIndex, 1);
      reorderedFiles.splice(finishIndex, 0, movedItem);
      return reorderedFiles;
    });
  }, []);

  // Handle PDF merge API call
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
      const response = await fetch("/api/merge-pdfs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Merge failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "merged.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert("Failed to merge PDFs. Please try again.");
    } finally {
      setIsMerging(false);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.url));
    };
  }, []); // Empty dependency array to run only on unmount

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
              PDFNinja
            </h1>
            <nav className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                Home
              </Link>
              <Link href="/merge" className="text-[#971E4C] font-medium">
                Merge PDF
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Merge PDF Files
          </h2>
          <p className="text-gray-600">
            Combine multiple PDFs into one document easily
          </p>
        </div>

        {/* File Input */}
        <div className="flex justify-center mb-8">
          <label
            htmlFor="pdf-upload"
            className="bg-[#971E4C] text-white px-6 py-3 rounded-md font-medium cursor-pointer hover:bg-[#7A173C] transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#971E4C] focus:ring-offset-2"
          >
            Select PDF Files
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Add More Files Button */}
        {files.length > 0 && (
          <div className="flex justify-end mb-4">
            <label
              htmlFor="pdf-upload"
              className="bg-gray-500 text-white px-4 py-2 rounded-md font-medium cursor-pointer hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Add more files
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        {/* Sortable PDF Grid with Preview */}
        {files.length > 0 && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="pdf-list" direction="horizontal">
              {(provided) => (
                <div
                  className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8"
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
                          <PDFCard file={file} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Merge Button */}
        {files.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleMerge}
              disabled={isMerging}
              className={`bg-[#971E4C] text-white px-8 py-3 rounded-md font-medium hover:bg-[#7A173C] transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#971E4C] focus:ring-offset-2 ${
                isMerging ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isMerging ? "Merging..." : "Merge PDFs"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

interface PDFFile {
  id: string;
  name: string;
  file: File;
  url: string;
  numPages?: number;
}

function PDFCard({ file }: { file: PDFFile }) {
  const [previewUrl, setPreviewUrl] = useState<string>(file.url);
  const [numPages, setNumPages] = useState<number>(0);

  // Update preview URL when file changes
  useEffect(() => {
    setPreviewUrl(file.url);
    // setIsLoading(true);
  }, [file.url]);

  return (
    <div
      id={`pdf-card-${file.id}`}
      key={file.id}
      className="group relative bg-white rounded-lg shadow-md cursor-move hover:shadow-lg transition-all duration-200 mx-2"
    >
      {/* PDF Preview with Padding */}
      <div className="p-4 flex justify-center items-center">
        <div className="h-48 w-full max-w-[180px] rounded-md overflow-hidden">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
            {previewUrl && (
              <div style={{}}>
                <Viewer
                  fileUrl={previewUrl}
                  initialPage={0}
                  defaultScale={SpecialZoomLevel.PageWidth}
                  onDocumentLoad={(pdf) => {
                    setNumPages(pdf.doc.numPages);
                  }}
                />
              </div>
            )}
          </Worker>
        </div>
      </div>

      {/* File Name Centered Below */}
      <div className="text-center py-2">
        <p className="text-sm text-gray-700 truncate">{file.name}</p>
      </div>

      {/* Tooltip on Hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
        <p>Name: {file.name}</p>
        <p>Size: {(file.file.size / 1024).toFixed(2)} KB</p>
        <p>Pages: {numPages || "Loading..."}</p>
      </div>
    </div>
  );
}
