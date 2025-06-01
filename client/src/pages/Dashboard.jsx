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
      // console.log("Shared PDFs API Response:", response.data);

      // Handle both possible response structures
      if (response.data && response.data.pdfs) {
        setSharedPdfs(response.data.pdfs);
      } else if (Array.isArray(response.data)) {
        setSharedPdfs(response.data);
      } else {
        console.error("Unexpected response structure:", response.data);
        setSharedPdfs([]);
      }
    } catch (error) {
      console.error("Error fetching shared PDFs:", error);
      toast.error("Failed to load shared PDFs");
      setSharedPdfs([]);
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

  const clearSearch = () => {
    setSearchQuery("");
  };

  const renderSearchBar = () => (
    <div className="relative mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder={`Search ${
            activeTab === "my-pdfs" ? "your PDFs" : "shared PDFs"
          }...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {searchQuery && (
        <div className="mt-2 text-sm text-gray-600">
          {activeTab === "my-pdfs"
            ? `Found ${filteredPdfs.length} of ${pdfs.length} PDFs`
            : `Found ${filteredSharedPdfs.length} of ${sharedPdfs.length} shared PDFs`}
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
            {searchQuery ? "No PDFs match your search" : "No PDFs found"}
          </h3>
          <p className="mt-2 text-gray-600">
            {searchQuery
              ? `Try a different search term or clear the search to see all PDFs`
              : "Upload your first PDF to get started"}
          </p>
          {searchQuery ? (
            <button
              onClick={clearSearch}
              className="mt-4 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              Upload PDF
            </button>
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
        <button
          onClick={fetchSharedPdfs}
          className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {renderSearchBar()}

      {sharedLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredSharedPdfs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
            {searchQuery
              ? "No shared PDFs match your search"
              : "No shared PDFs found"}
          </h3>
          <p className="mt-2 text-gray-600">
            {searchQuery
              ? "Try a different search term or clear the search to see all shared PDFs"
              : "PDFs shared with you will appear here"}
          </p>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="mt-4 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSharedPdfs.map((pdf) => (
            <div
              key={pdf._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-green-500"
            >
              <div className="p-4 border-b">
                <h3
                  className="text-lg font-medium text-gray-900 truncate"
                  title={pdf.title}
                >
                  {pdf.title}
                </h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Shared by {pdf.owner?.name || pdf.owner?.email || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Shared on{" "}
                    {new Date(
                      pdf.sharedAt || pdf.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <Link
                  to={`/external/${pdf._id}`}
                  className="flex justify-center items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md w-full transition-colors"
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow-sm">
          <button
            onClick={() => setActiveTab("my-pdfs")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === "my-pdfs"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-transparent text-gray-700 hover:bg-gray-100"
            }`}
          >
            My PDFs ({pdfs.length})
          </button>
          <button
            onClick={() => setActiveTab("shared-with-me")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === "shared-with-me"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-transparent text-gray-700 hover:bg-gray-100"
            }`}
          >
            Shared with Me ({sharedPdfs.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === "my-pdfs" ? renderMyPdfs() : renderSharedPdfs()}
        </div>

        <UploadPdfModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      </div>
    </div>
  );
};

export default Dashboard;
