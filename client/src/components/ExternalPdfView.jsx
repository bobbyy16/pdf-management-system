import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import CommentSection from "../components/CommentSection";
import { useAuth } from "../contexts/AuthContext";

const ExternalPdfView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error("Please login to access this PDF");
      navigate("/login");
      return;
    }
    fetchExternalPdf();
  }, [id, user]);

  const fetchExternalPdf = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/pdf-sharing/${id}/external-access`);
      setPdf(response.data);
      setHasAccess(true);
    } catch (error) {
      console.error("Error fetching external PDF:", error);
      if (error.response?.status === 403) {
        toast.error("You don't have access to this PDF");
      } else {
        toast.error("Failed to load PDF");
      }
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!pdf || !hasAccess) {
    return (
      <div className="text-center my-12">
        <h2 className="text-xl font-semibold text-gray-800">
          PDF not found or access denied
        </h2>
        <p className="mt-2 text-gray-600">
          You don't have permission to view this PDF.
        </p>
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
          <h1 className="text-2xl font-bold text-gray-800">{pdf.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Shared document • Uploaded on{" "}
            {new Date(pdf.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back to Dashboard
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
    </div>
  );
};

export default ExternalPdfView;
