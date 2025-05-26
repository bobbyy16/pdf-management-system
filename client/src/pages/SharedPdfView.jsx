import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import CommentSection from "../components/CommentSection";

const SharedPdfView = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    if (!token) {
      toast.error("Invalid access link");
      navigate("/");
      return;
    }

    fetchSharedPdf(token);
  }, [id, location.search]);

  const fetchSharedPdf = async (token) => {
    try {
      setLoading(true);

      // Only handle public links in this component
      const response = await api.get(`/pdf-sharing/${id}/view?token=${token}`);
      setPdf(response.data);
    } catch (error) {
      console.error("Error fetching shared PDF:", error);
      toast.error("Failed to access PDF. The link may be invalid or expired.");
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

  if (!pdf) {
    return (
      <div className="text-center my-12">
        <h2 className="text-xl font-semibold text-gray-800">
          PDF not found or access denied
        </h2>
        <p className="mt-2 text-gray-600">The link may be invalid.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{pdf.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Public shared document • View only access
        </p>
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
          <CommentSection pdfId={id} isPublicView={true} />
        </div>
      </div>
    </div>
  );
};

export default SharedPdfView;
