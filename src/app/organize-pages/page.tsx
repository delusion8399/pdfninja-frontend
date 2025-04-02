"use client";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import React, { useCallback, useEffect, useState } from "react";
import { Document, Page as PDFPage, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { config } from "@/config";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFPage {
  id: string;
  pageNumber: number;
}

interface PDFFile {
  id: string;
  name: string;
  file: File;
  url: string;
  size: number;
  numPages?: number;
  pages: PDFPage[];
}

export default function Page() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      const fileUrl = URL.createObjectURL(selectedFile);
      const fileObj: PDFFile = {
        id: `${selectedFile.name}-${Date.now()}`,
        name: selectedFile.name,
        file: selectedFile,
        url: fileUrl,
        size: selectedFile.size,
        pages: [],
      };

      setFile(fileObj);
      setError(null);
    } catch (error) {
      console.error("Error loading PDF:", error);
      setError("Failed to load PDF. Please try again.");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    if (!file) return;

    // Update the pages array with the actual number of pages
    const pages: PDFPage[] = [];
    for (let i = 1; i <= numPages; i++) {
      pages.push({
        id: `page-${i}`,
        pageNumber: i,
      });
    }

    setFile((prevFile) => {
      if (!prevFile) return null;
      return {
        ...prevFile,
        numPages,
        pages,
      };
    });
    setError(null);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error("Error loading PDF:", err);
    setError(err.message);
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (file?.url) {
        URL.revokeObjectURL(file.url);
      }
    };
  }, [file]);

  const onDragEnd = useCallback(
    (result: any) => {
      if (!result.destination || !file) return;

      const startIndex = result.source.index;
      const finishIndex = result.destination.index;

      setFile((prevFile) => {
        if (!prevFile) return null;

        const reorderedPages = Array.from(prevFile.pages);
        const [movedItem] = reorderedPages.splice(startIndex, 1);
        reorderedPages.splice(finishIndex, 0, movedItem);

        return {
          ...prevFile,
          pages: reorderedPages,
        };
      });
    },
    [file]
  );

  // Memoize the draggable items to improve performance
  const renderDraggableItems = useCallback(() => {
    if (!file) return null;

    return (
      <Document
        file={file.url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-black font-bold">Loading...</div>
          </div>
        }
        error={
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-black font-bold">
              {error || "Error loading PDF"}
            </div>
          </div>
        }
        className="flex items-center justify-center w-full h-full gap-5"
      >
        {file.pages.map((page, index) => (
          <Draggable key={page.id} draggableId={page.id} index={index}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="relative bg-white border-4 border-black overflow-hidden transition-all duration-200 w-[200px] h-[280px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px]"
              >
                <div className="w-full h-[250px] relative flex items-center justify-center">
                  <PDFPage
                    pageNumber={page.pageNumber}
                    width={200}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    scale={1}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 border-t-4 border-black text-center bg-[#4DCCFF] h-[30px] flex items-center justify-center">
                  <p className="text-sm text-black font-bold">
                    Page {page.pageNumber}
                  </p>
                </div>
              </div>
            )}
          </Draggable>
        ))}
      </Document>
    );
  }, [file, error, onDocumentLoadSuccess, onDocumentLoadError]);

  const handleSaveChanges = async () => {
    if (!file) {
      alert("Please select a PDF to organize.");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("pdf", file.file);
    formData.append(
      "pageOrder",
      JSON.stringify(file.pages.map((page) => page.pageNumber))
    );

    try {
      const response = await fetch(`${config.apiBaseUrl}/pdf/organize`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to organize PDF");
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "organized.pdf"; // Default filename
      if (contentDisposition) {
        const matches = /filename=(?:"([^"]+)"|([^;]+))/.exec(
          contentDisposition
        );
        if (matches && (matches[1] || matches[2])) {
          filename = matches[1] || matches[2];
        }
      }

      // Get the PDF data as a blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      // Show success message
    } catch (error) {
      console.error("Error organizing PDF:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to organize PDF. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFDE59] antialiased">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex-1 relative">
          {!file && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-1 relative max-w-2xl w-full text-center">
                <h2 className="text-4xl font-black text-black mb-4 tracking-tight">
                  Organize PDF Pages
                </h2>
                <p className="text-xl text-black mb-8 font-medium">
                  Drag and drop pages to reorder them in your PDF document.
                </p>
                <label
                  htmlFor="pdf-upload"
                  className="bg-[#FF3A5E] text-white px-8 py-4 border-3 border-black font-bold cursor-pointer hover:bg-[#FF6B87] transition-all duration-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] inline-block"
                >
                  Select PDF file
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="text-black mt-4 font-bold">or drop PDF here</p>
                <div className="absolute -top-6 -right-6 bg-[#4DCCFF] border-3 border-black p-3 transform rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xl font-black">DRAG & DROP</span>
                </div>
              </div>
            </div>
          )}

          {file && (
            <div className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-8">
              <div className="grid grid-cols-1 gap-4">
                <div className="border-3 border-black p-3">
                  <h3 className="text-lg font-bold mb-2 text-black">
                    Reorder Pages
                  </h3>
                  <div className="bg-[#FFDE59] border-2 border-black p-2 mb-2">
                    <p className="text-black font-medium text-sm">
                      Drag and drop the pages below to reorder them. The new
                      order will be saved when you click &quot;Save
                      Changes&quot;.
                    </p>
                  </div>

                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="pdf-pages" direction="horizontal">
                      {(provided) => (
                        <div
                          className="flex flex-wrap gap-12 mb-6 px-4 max-w-[1000px] mx-auto min-h-[300px]"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {renderDraggableItems()}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-black font-bold">
                      Total Pages: {file.numPages || 0}
                    </div>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isProcessing}
                      className={`bg-[#FF3A5E] text-white px-6 py-3 border-3 border-black font-bold hover:bg-[#FF6B87] transition-all duration-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] ${
                        isProcessing ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isProcessing ? "Processing..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                Select the PDF file you want to reorganize.
              </p>
            </div>
            <div className="bg-[#FFDE59] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                2
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">
                Reorder Pages
              </h3>
              <p className="text-black">
                Drag and drop pages to arrange them in your desired order.
              </p>
            </div>
            <div className="bg-[#FF3A5E] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                3
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">
                Download Reorganized PDF
              </h3>
              <p className="text-black">
                Get your PDF with pages in the new order.
              </p>
            </div>
          </div>
        </div>
      </div>

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
          </div>
        </div>
      </footer>
    </div>
  );
}
