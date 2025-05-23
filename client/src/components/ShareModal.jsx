"use client";

import { useState, useEffect, useRef } from "react";
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
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSearchQuery("");
      setFilteredUsers([]);
      setPublicShareLink("");
      setShowDropdown(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowDropdown(true);
    } else {
      setFilteredUsers([]);
      setShowDropdown(false);
    }
  }, [searchQuery, users]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setIsSearching(true);
      // Fixed API endpoint - should match your backend route
      const response = await api.get("/pdf-sharing/users");

      // Handle the response structure from your backend
      const userData = response.data.users || response.data || [];
      setUsers(userData);
      // console.log("Fetched users:", userData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGrantAccess = async (user) => {
    if (isGrantingAccess) return;

    try {
      setIsGrantingAccess(true);
      await api.post(`/pdf-sharing/${pdfId}/share/email`, {
        userId: user._id,
        email: user.email,
      });
      toast.success(`Access granted to ${user.name || user.email}`);
      setSearchQuery("");
      setFilteredUsers([]);
      setShowDropdown(false);
    } catch (error) {
      console.error("Error granting access:", error);
      toast.error(error.response?.data?.error || "Failed to grant access");
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
        error.response?.data?.error || "Failed to generate public link"
      );
    } finally {
      setIsGeneratingPublic(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard");
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && filteredUsers.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Share PDF</h3>

          {/* Email Access Section */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Grant access to specific user
            </h4>
            <div className="relative" ref={dropdownRef}>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder="Search users by name or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSearching || isGrantingAccess}
              />

              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* Show all users when input is focused and empty, or show filtered results */}
              {showDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {(searchQuery.trim() ? filteredUsers : users).length > 0 ? (
                    (searchQuery.trim() ? filteredUsers : users).map((user) => (
                      <div
                        key={user._id}
                        onClick={() => handleGrantAccess(user)}
                        className={`px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                          isGrantingAccess
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                              {(user.name || user.email || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name || "No name"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-center text-gray-500">
                      {isSearching ? "Loading users..." : "No users found"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Add a button to show all users if dropdown is not showing */}
            {!showDropdown && users.length > 0 && (
              <button
                onClick={() => {
                  setShowDropdown(true);
                  inputRef.current?.focus();
                }}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700"
              >
                Click to browse all users ({users.length} available)
              </button>
            )}
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
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isGeneratingPublic && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(publicShareLink)}
                    className="ml-3 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex-shrink-0"
                    title="Copy to clipboard"
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
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
