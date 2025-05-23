"use client";

import { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const ShareModal = ({ isOpen, onClose, pdfId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingPublic, setIsGeneratingPublic] = useState(false);
  const [publicShareLink, setPublicShareLink] = useState("");
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setIsSearching(true);
      const response = await api.get("/users/all");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsSearching(false);
    }
  };

  const handleGrantAccess = async (user) => {
    try {
      setIsGrantingAccess(true);
      await api.post(`/pdf-sharing/${pdfId}/share/email`, {
        userId: user._id,
        email: user.email,
      });
      toast.success(`Access granted to ${user.name || user.email}`);
      setSearchQuery("");
      setFilteredUsers([]);
    } catch (error) {
      console.error("Error granting access:", error);
      toast.error(error.response?.data?.message || "Failed to grant access");
    } finally {
      setIsGrantingAccess(false);
    }
  };

  const handleGeneratePublicLink = async () => {
    try {
      setIsGeneratingPublic(true);
      const response = await api.post(`/pdf-sharing/${pdfId}/share/public`);
      setPublicShareLink(response.data.publicLink);
      toast.success("Public link generated");
    } catch (error) {
      console.error("Error generating public link:", error);
      toast.error(
        error.response?.data?.message || "Failed to generate public link"
      );
    } finally {
      setIsGeneratingPublic(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-lg w-full">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Share PDF</h3>

          {/* Email Access Section */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Grant access to specific user
            </h4>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isSearching}
              />

              {/* Dropdown for filtered users */}
              {filteredUsers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleGrantAccess(user)}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      disabled={isGrantingAccess}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name || "No name"}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.trim() &&
                filteredUsers.length === 0 &&
                !isSearching && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500">
                    No users found
                  </div>
                )}
            </div>
          </div>

          {/* Public Link Section */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Generate public link
            </h4>
            <div className="flex">
              <button
                onClick={handleGeneratePublicLink}
                disabled={isGeneratingPublic}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50"
              >
                {isGeneratingPublic ? "Generating..." : "Generate Public Link"}
              </button>
            </div>

            {publicShareLink && (
              <div className="mt-3">
                <div className="flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={publicShareLink}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(publicShareLink)}
                    className="ml-3 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  This link will work for anyone with the link. No expiration.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
