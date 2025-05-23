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

  useEffect(() => {
    fetchPdfDetails();
  }, [id]);

  const fetchPdfDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/pdfs/${id}`);
      setPdf(response.data);
      setNewTitle(response.data.title);
      //   console.log("PDF details:", response.data);
    } catch (error) {
      console.error("Error fetching PDF details:", error);
      toast.error("Failed to load PDF details");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTitle = async () => {
    try {
      await api.put(`/pdfs/${id}`, { title: newTitle });
      setPdf({ ...pdf, title: newTitle });
      setIsEditingTitle(false);
      toast.success("Title updated successfully");
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="text-center my-12">
        <h2 className="text-xl font-semibold text-gray-800">PDF not found</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          {isEditingTitle ? (
            <div className="flex items-center">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter document title"
              />
              <button
                onClick={handleUpdateTitle}
                className="ml-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingTitle(false);
                  setNewTitle(pdf.title);
                }}
                className="ml-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">{pdf.title}</h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="ml-2 text-gray-500 hover:text-gray-700"
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
            Uploaded on {new Date(pdf.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
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
              <iframe
                src={`https://drive.google.com/file/d/${pdf.fileId}/preview`}
                title={pdf.title}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <CommentSection pdfId={id} />
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        pdfId={id}
      />
    </div>
  );
};

export default PdfView;
