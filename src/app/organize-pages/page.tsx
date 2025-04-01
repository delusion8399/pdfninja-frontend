"use client";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import * as pdfjsLib from "pdfjs-dist";
import React, { useCallback, useEffect, useRef, useState } from "react";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@5.0.375/build/pdf.worker.min.mjs";

interface PDFPage {
  id: string;
  pageNumber: number;
  renderUrl?: string;
}

interface PDFFile {
  id: string;
  name: string;
  file: File;
  url: string;
  size: number;
  numPages?: number;
  pages: PDFPage[];
  pdfDocument?: pdfjsLib.PDFDocumentProxy;
}

export default function Page() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsLoading(true);

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

      // Load the PDF document and cache it
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;

      // Store the PDF document in the file object for reuse
      fileObj.pdfDocument = pdfDocument;
      fileObj.numPages = numPages;

      // Create page objects
      const pages: PDFPage[] = [];
      for (let i = 1; i <= numPages; i++) {
        pages.push({
          id: `page-${i}`,
          pageNumber: i,
        });
      }
      fileObj.pages = pages;

      setFile(fileObj);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Failed to load PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = useCallback(
    async (pageNum: number, canvasElement: HTMLCanvasElement) => {
      if (!file) return;

      try {
        // Use cached PDF document if available, otherwise load it
        let pdfDocument = file.pdfDocument;
        if (!pdfDocument) {
          console.warn("PDF document not cached, this should not happen");
          return;
        }

        const page = await pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.5 }); // Smaller scale for thumbnails

        const canvas = canvasElement;
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
        console.error(`Error rendering page ${pageNum}:`, error);
      }
    },
    [file]
  );

  useEffect(() => {
    if (file && file.pages.length > 0 && file.pdfDocument) {
      // Use a more efficient approach to render pages with throttling
      const renderPages = async () => {
        // Create a queue of pages to render
        const pagesToRender = [...file.pages];

        // Process pages in batches to avoid blocking the UI
        const processBatch = async () => {
          // Process up to 3 pages at a time
          const batch = pagesToRender.splice(0, 3);
          if (batch.length === 0) return;

          // Render the batch of pages concurrently
          await Promise.all(
            batch.map(async (page) => {
              const canvas = canvasRefs.current[page.id];
              if (canvas) {
                await renderPage(page.pageNumber, canvas);
              }
            })
          );

          // If there are more pages to render, schedule the next batch
          if (pagesToRender.length > 0) {
            // Add a small delay to allow the UI to update
            setTimeout(processBatch, 10);
          }
        };

        // Start processing the first batch
        await processBatch();
      };

      renderPages();
    }
  }, [file, renderPage]);

  // Add a separate effect to handle PDF document cleanup
  useEffect(() => {
    // Cleanup function to handle PDF document and URL resources
    return () => {
      if (file) {
        // Clean up URL resources
        URL.revokeObjectURL(file.url);

        // Clean up PDF document if it exists
        if (file.pdfDocument) {
          file.pdfDocument.destroy();
        }
      }
    };
  }, [file]);

  // This effect is now handled by the dedicated cleanup effect below
  useEffect(() => {
    // Empty dependency array ensures this only runs on component unmount
  }, []);

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

        // Preserve the PDF document reference when updating state
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

    return file.pages.map((page, index) => (
      <Draggable key={page.id} draggableId={page.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`border-3 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 ${
              snapshot.isDragging ? "z-10" : ""
            }`}
          >
            <div className="relative">
              <canvas
                ref={(el) => {
                  canvasRefs.current[page.id] = el;
                }}
                className="w-32 h-40 object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-[#4DCCFF] border-t-2 border-black p-1 text-center">
                <span className="font-bold text-black">
                  Page {page.pageNumber}
                </span>
              </div>
              <div className="absolute top-0 right-0 bg-[#FF3A5E] border-l-2 border-b-2 border-black p-1 text-xs font-bold">
                {index + 1}
              </div>
            </div>
          </div>
        )}
      </Draggable>
    ));
  }, [file]);

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
      // This is a placeholder for the actual API call
      // In a real implementation, you would call your backend API
      // For now, we'll simulate processing with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate a processed file (in reality, this would come from the API)
      const processedUrl = file.url; // In a real implementation, this would be the URL of the processed file

      // In a real implementation, you would download the processed file
      const link = document.createElement("a");
      link.href = processedUrl;
      link.download = `${file.name.replace(".pdf", "")}_organized.pdf`;
      link.click();
    } catch (error) {
      console.error("Error organizing PDF pages:", error);
      alert("Failed to organize PDF pages. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
                  Rearrange the pages of your PDF document by dragging and
                  dropping them into your preferred order.
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
                    disabled={isLoading}
                  />
                </label>
                <p className="text-black mt-4 font-bold">or drop PDF here</p>
                <div className="absolute -top-6 -right-6 bg-[#4DCCFF] border-3 border-black p-3 transform rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xl font-black">DRAG & DROP</span>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
                <p className="text-xl font-bold text-black">
                  Loading PDF pages...
                </p>
              </div>
            </div>
          )}

          {file && !isLoading && (
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-black">
                  Organize Pages: {file.name}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setFile(null);
                    }}
                    className="bg-[#4DCCFF] text-black px-3 py-1 border-2 border-black font-bold text-sm hover:bg-[#7DDAFF] transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                  >
                    Change PDF
                  </button>
                </div>
              </div>

              <div className="bg-[#FFDE59] border-2 border-black p-4 mb-6">
                <p className="text-black font-medium">
                  Drag and drop the pages below to rearrange them. Once
                  you&apos;re satisfied with the order, click &quot;Save
                  Changes&quot; to download your reorganized PDF.
                </p>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="pdf-pages" direction="horizontal">
                  {(provided) => (
                    <div
                      className="flex flex-wrap gap-4 mb-6"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {renderDraggableItems()}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-black font-bold">
                    Total Pages: {file.pages.length}
                  </p>
                  <p className="text-black">
                    Size: {formatFileSize(file.size)}
                  </p>
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
          )}

          {/* How It Works Section */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1 mb-8">
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
                  Select the PDF file you want to reorganize from your device.
                </p>
              </div>
              <div className="bg-[#FFDE59] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2 text-black">
                  Drag & Drop Pages
                </h3>
                <p className="text-black">
                  Rearrange the pages by dragging and dropping them into your
                  desired order.
                </p>
              </div>
              <div className="bg-[#FF3A5E] border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-3xl font-black mb-4 bg-white w-10 h-10 flex items-center justify-center border-2 border-black">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2 text-black">
                  Download Organized PDF
                </h3>
                <p className="text-black">
                  Save your changes and download the reorganized PDF document.
                </p>
              </div>
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
              <a href="#" className="text-black hover:text-[#FF3A5E]">
                Privacy Policy
              </a>
              <a href="#" className="text-black hover:text-[#FF3A5E]">
                Terms of Service
              </a>
              <a href="#" className="text-black hover:text-[#FF3A5E]">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
