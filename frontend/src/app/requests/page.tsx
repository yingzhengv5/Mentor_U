"use client";

import { useGroup } from "@/contexts/GroupContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RequestStatus } from "@/interfaces/group";

export default function RequestsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    pendingRequests,
    myRequests,
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

    pollRequests();
    const intervalId = setInterval(pollRequests, 2000);
    return () => clearInterval(intervalId);
  }, [user, router, authLoading, pollRequests]);

  const handleApprove = async (groupId: string, userId: string) => {
    try {
      await approveRequest(groupId, userId);
      pollRequests();
    } catch (err) {
      console.error("Error approving request:", err);
      alert("Failed to approve request. Please try again.");
    }
  };

  const handleReject = async (groupId: string, userId: string) => {
    try {
      await rejectRequest(groupId, userId);
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

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.Accepted:
        return "bg-green-100 text-green-800";
      case RequestStatus.Rejected:
        return "bg-red-100 text-red-800";
      case RequestStatus.Pending:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.Accepted:
        return "Accepted";
      case RequestStatus.Rejected:
        return "Rejected";
      case RequestStatus.Pending:
        return "Pending";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
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

        {/* Requests I need to handle */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pending Approvals
            </h2>
            <div className="grid gap-4">
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
          </div>
        )}

        {/* My requests */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            My Group Requests
          </h2>
          {myRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-500">No requests made yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {myRequests.map((request) => (
                <div
                  key={`${request.userId}-${request.groupId}`}
                  className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.groupName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created by {request.creatorName}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        request.status
                      )}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
