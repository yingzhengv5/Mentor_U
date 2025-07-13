"use client";

import { useGroup } from "@/contexts/GroupContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function RequestsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    pendingRequests,
    approveRequest,
    rejectRequest,
    isLoading,
    refreshGroups,
  } = useGroup();
  const router = useRouter();

  // Fetch requests data periodically
  const pollRequests = useCallback(async () => {
    if (!user) return;
    try {
      await refreshGroups();
    } catch (error) {
      console.error("Error polling requests:", error);
    }
  }, [user, refreshGroups]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    // Initial fetch
    pollRequests();

    // Set up polling interval (every 10 seconds)
    const intervalId = setInterval(pollRequests, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [user, router, authLoading, pollRequests]);

  const handleApprove = async (groupId: string, userId: string) => {
    try {
      await approveRequest(groupId, userId);
      // Refresh the requests list immediately after approval
      pollRequests();
    } catch (err) {
      console.error("Error approving request:", err);
      alert("Failed to approve request. Please try again.");
    }
  };

  const handleReject = async (groupId: string, userId: string) => {
    try {
      await rejectRequest(groupId, userId);
      // Refresh the requests list immediately after rejection
      pollRequests();
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Failed to reject request. Please try again.");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join Requests</h1>
          <button
            onClick={pollRequests}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
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

        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500">No pending join requests</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingRequests.map((request) => (
              <div
                key={`${request.userId}-${request.groupId}`}
                className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {request.user.firstName} {request.user.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      wants to join{" "}
                      <span className="font-medium">{request.groupName}</span>
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() =>
                        handleReject(request.groupId!, request.userId)
                      }
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                      Reject
                    </button>
                    <button
                      onClick={() =>
                        handleApprove(request.groupId!, request.userId)
                      }
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
