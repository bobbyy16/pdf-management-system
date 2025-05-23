"use client";

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import UploadPdfModal from "../components/UploadPdfModal";

const Dashboard = () => {
  const [pdfs, setPdfs] = useState([]);
  const [sharedPdfs, setSharedPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharedLoading, setSharedLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("my-pdfs");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPdfs();
    fetchSharedPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/pdfs/my-pdfs");
      setPdfs(response.data);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
      toast.error("Failed to load your PDFs");
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedPdfs = async () => {
    try {
      setSharedLoading(true);
      const response = await api.get("/pdf-sharing/shared-with-me");
      setSharedPdfs(response.data);
    } catch (error) {
      console.error("Error fetching shared PDFs:", error);
      // Don't show error toast for shared PDFs as it might not be implemented yet
    } finally {
      setSharedLoading(false);
    }
  };

  const handleDeletePdf = async (id) => {
    if (!window.confirm("Are you sure you want to delete this PDF?")) {
      return;
    }

    try {
      await api.delete(`/pdfs/${id}`);
      setPdfs(pdfs.filter((pdf) => pdf._id !== id));
      toast.success("PDF deleted successfully");
    } catch (error) {
      console.error("Error deleting PDF:", error);
      toast.error("Failed to delete PDF");
    }
  };

  const handleUploadSuccess = () => {
    fetchPdfs();
    setIsUploadModalOpen(false);
  };

  // Filter PDFs based on search query
  const filteredPdfs = useMemo(() => {
    if (!searchQuery.trim()) return pdfs;
    return pdfs.filter((pdf) =>
      pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pdfs, searchQuery]);

  const filteredSharedPdfs = useMemo(() => {
    if (!searchQuery.trim()) return sharedPdfs;
    return sharedPdfs.filter((pdf) =>
      pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sharedPdfs, searchQuery]);

  const renderSearchBar = () => (
    <div className="mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder={`Search ${
            activeTab === "my-pdfs" ? "your PDFs" : "shared PDFs"
          }...`}
        />
        {searchQuery && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={() => setSearchQuery("")}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      {searchQuery && (
        <div className="mt-2 text-sm text-gray-600">
          {activeTab === "my-pdfs"
            ? `${filteredPdfs.length} of ${pdfs.length} PDFs found`
            : `${filteredSharedPdfs.length} of ${sharedPdfs.length} shared PDFs found`}
        </div>
      )}
    </div>
  );

  const renderMyPdfs = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My PDFs</h2>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Upload PDF
        </button>
      </div>

      {renderSearchBar()}

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredPdfs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {searchQuery ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No PDFs found
              </h3>
              <p className="mt-2 text-gray-600">
                No PDFs match your search for "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No PDFs found
              </h3>
              <p className="mt-2 text-gray-600">
                Upload your first PDF to get started
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Upload PDF
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPdfs.map((pdf) => (
            <div
              key={pdf._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4 border-b">
                <h3
                  className="text-lg font-medium text-gray-900 truncate"
                  title={pdf.title}
                >
                  {pdf.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Uploaded on {new Date(pdf.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 flex flex-col space-y-2">
                <Link
                  to={`/pdf/${pdf._id}`}
                  className="flex justify-center items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  View & Share
                </Link>
                <button
                  onClick={() => handleDeletePdf(pdf._id)}
                  className="flex justify-center items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSharedPdfs = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Shared with Me</h2>
      </div>

      {renderSearchBar()}

      {sharedLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredSharedPdfs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {searchQuery ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No shared PDFs found
              </h3>
              <p className="mt-2 text-gray-600">
                No shared PDFs match your search for "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No shared PDFs found
              </h3>
              <p className="mt-2 text-gray-600">
                PDFs shared with you will appear here
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSharedPdfs.map((pdf) => (
            <div
              key={pdf._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4 border-b">
                <h3
                  className="text-lg font-medium text-gray-900 truncate"
                  title={pdf.title}
                >
                  {pdf.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Shared by {pdf.owner?.name || pdf.owner?.email || "Unknown"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Shared on{" "}
                  {new Date(pdf.sharedAt || pdf.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4">
                <Link
                  to={`/external/${pdf._id}`}
                  className="flex justify-center items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md w-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  View Shared PDF
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab("my-pdfs")}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === "my-pdfs"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          My PDFs ({pdfs.length})
        </button>
        <button
          onClick={() => setActiveTab("shared-with-me")}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === "shared-with-me"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Shared with Me ({sharedPdfs.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "my-pdfs" ? renderMyPdfs() : renderSharedPdfs()}

      <UploadPdfModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default Dashboard;
