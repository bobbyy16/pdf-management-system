"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import CommentSection from "../components/CommentSection";
import ShareModal from "../components/ShareModal";

const PdfView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchPdfDetails();
    } else {
      setError("No PDF ID provided");
      setLoading(false);
    }
  }, [id]);

  const fetchPdfDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/pdfs/${id}`);

      if (response.data) {
        setPdf(response.data);
        setNewTitle(response.data.title || "");
      } else {
        throw new Error("No PDF data received");
      }
    } catch (error) {
      console.error("Error fetching PDF details:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load PDF details";
      setError(errorMessage);
      toast.error(errorMessage);

      // Only navigate away if it's a 404 or similar client error
      if (error.response?.status === 404) {
        setTimeout(() => navigate("/"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!newTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      await api.put(`/pdfs/${id}`, { title: newTitle.trim() });
      setPdf({ ...pdf, title: newTitle.trim() });
      setIsEditingTitle(false);
      toast.success("Title updated successfully");
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error(error.response?.data?.message || "Failed to update title");
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setNewTitle(pdf?.title || "");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUpdateTitle();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error || !pdf) {
    return (
      <div className="text-center my-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {error || "PDF not found"}
          </h2>
          <p className="text-gray-600 mb-4">
            The PDF you're looking for might have been removed or you don't have
            access to it.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          {isEditingTitle ? (
            <div className="flex items-center flex-wrap gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="px-3 py-2 border border-gray-300 rounded-md flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter document title"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateTitle}
                  disabled={!newTitle.trim()}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800 mr-2">
                {pdf.title || "Untitled Document"}
              </h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
                title="Edit title"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Uploaded on{" "}
            {pdf.createdAt
              ? new Date(pdf.createdAt).toLocaleDateString()
              : "Unknown date"}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 h-[70vh]">
              {pdf.fileId ? (
                <iframe
                  src={`https://drive.google.com/file/d/${pdf.fileId}/preview`}
                  title={pdf.title || "PDF Document"}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  onError={(e) => {
                    console.error("PDF iframe failed to load:", e);
                    toast.error("Failed to load PDF preview");
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <p className="text-gray-500">PDF preview not available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {id && <CommentSection pdfId={id} />}
        </div>
      </div>

      {/* Only render ShareModal when we have a valid ID and the modal should be open */}
      {id && isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          pdfId={id}
        />
      )}
    </div>
  );
};

export default PdfView;
