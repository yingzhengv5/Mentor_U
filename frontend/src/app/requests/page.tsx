"use client";

import { useGroup } from "@/contexts/GroupContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RequestsPage() {
  const { user } = useAuth();
  const { pendingRequests, approveRequest, rejectRequest, isLoading } =
    useGroup();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  const handleApprove = async (groupId: string, userId: string) => {
    try {
      await approveRequest(groupId, userId);
    } catch (err) {
      console.error("Error approving request:", err);
      alert("Failed to approve request. Please try again.");
    }
  };

  const handleReject = async (groupId: string, userId: string) => {
    try {
      await rejectRequest(groupId, userId);
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Failed to reject request. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Join Requests</h1>

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
