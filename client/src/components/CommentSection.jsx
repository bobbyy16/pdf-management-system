import { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const CommentSection = ({ pdfId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [pdfId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/pdf/${pdfId}/comments`);
      // console.log("Fetched comments:", response.data.comments);
      setComments(response.data.comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await api.post(`/pdf/${pdfId}/comments`, {
        text: newComment,
      });

      //   console.log("New comment response:", response.data.comment);
      setComments([...comments, response.data.comment]);
      setNewComment("");
      toast.success("Comment added");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment or dont have access");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const response = await api.put(`/pdf/comments/${commentId}`, {
        text: editText,
      });

      //   console.log("Updated comment response:", response.data.comment);
      setComments(
        comments.map((comment) =>
          comment._id === commentId ? response.data.comment : comment
        )
      );
      setEditingCommentId(null);
      toast.success("Comment updated");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await api.delete(`/pdf/comments/${commentId}`);
      setComments(comments.filter((comment) => comment._id !== commentId));
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
  };

  // Helper function to get user display name and initial
  const getUserInfo = (comment) => {
    if (!comment.user) {
      return { name: "Unknown User", initial: "U" };
    }

    const name = comment.user.name || comment.user.email || "Unknown User";
    const initial = name.charAt(0).toUpperCase();

    return { name, initial };
  };

  // Helper function to check if user can edit/delete comment
  const canModifyComment = (comment) => {
    return user && comment.user && comment.user._id === user._id;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Comments</h3>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="mb-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>

        {loading ? (
          <div className="flex justify-center my-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const userInfo = getUserInfo(comment);

              return (
                <div key={comment._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          {userInfo.initial}
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {userInfo.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {canModifyComment(comment) && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(comment)}
                          className="text-gray-500 hover:text-gray-700"
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
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {editingCommentId === comment._id ? (
                    <div className="mt-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows="3"
                      ></textarea>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => handleEditComment(comment._id)}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-gray-700">
                      {comment.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
