"use client";

import { useGroup } from "@/contexts/GroupContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RequestStatus } from "@/interfaces/group";
import { useMentorship } from "@/contexts/MentorshipContext";
import { UserRole } from "@/interfaces/auth";
import { MentorshipStatus } from "@/interfaces/mentorship";
import { Mentorship } from "@/interfaces/mentorship";

export default function RequestsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    pendingRequests: groupPendingRequests,
    myRequests: groupRequests,
    approveRequest: approveGroupRequest,
    rejectRequest: rejectGroupRequest,
    isLoading,
    refreshGroups,
  } = useGroup();
  const {
    myRequests: mentorshipRequests,
    respondToRequest: respondToMentorshipRequest,
  } = useMentorship();

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
      await approveGroupRequest(groupId, userId);
      pollRequests();
    } catch (err) {
      console.error("Error approving request:", err);
      alert("Failed to approve request. Please try again.");
    }
  };

  const handleReject = async (groupId: string, userId: string) => {
    try {
      await rejectGroupRequest(groupId, userId);
      pollRequests();
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Failed to reject request. Please try again.");
    }
  };

  const handleMentorshipResponse = async (
    mentorshipId: string,
    accept: boolean
  ) => {
    try {
      await respondToMentorshipRequest(mentorshipId, accept);
      pollRequests();
    } catch (err) {
      console.error("Error responding to mentorship request:", err);
      alert("Failed to respond to mentorship request. Please try again.");
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

  const renderMentorshipActions = (request: Mentorship) => {
    if (request.status !== MentorshipStatus.Pending) {
      return (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getMentorshipStatusColor(
            request.status
          )}`}>
          {getMentorshipStatusText(request.status)}
        </span>
      );
    }

    return (
      <div className="flex space-x-3">
        <button
          onClick={() => handleMentorshipResponse(request.id, false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Reject
        </button>
        <button
          onClick={() => handleMentorshipResponse(request.id, true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Approve
        </button>
      </div>
    );
  };

  const getMentorshipStatusColor = (status: MentorshipStatus) => {
    const colors = {
      [MentorshipStatus.Pending]: "bg-yellow-100 text-yellow-800",
      [MentorshipStatus.Active]: "bg-green-100 text-green-800",
      [MentorshipStatus.Completed]: "bg-gray-100 text-gray-600",
      [MentorshipStatus.Cancelled]: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  const getMentorshipStatusText = (status: MentorshipStatus) => {
    const statusText = {
      [MentorshipStatus.Pending]: "Pending",
      [MentorshipStatus.Active]: "Active",
      [MentorshipStatus.Completed]: "Completed",
      [MentorshipStatus.Cancelled]: "Cancelled",
    };
    return statusText[status];
  };

  const renderGroupRequests = () => {
    // 如果用户是 group creator，显示待处理的加入请求
    if (groupPendingRequests.length > 0) {
      return (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Pending Group Join Requests
          </h3>
          {groupPendingRequests.map((request) => (
            <div
              key={`pending-${request.groupId}-${request.userId}`}
              className="mb-4 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-medium text-gray-900">
                    {request.user.firstName} {request.user.lastName}
                  </h4>
                  <p className="text-sm text-gray-500">
                    wants to join {request.groupName}
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
      );
    }

    // 显示用户自己的加入请求
    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          My Group Join Requests
        </h3>
        {groupRequests.map((request) => (
          <div
            key={`my-group-${request.groupId}`}
            className="mb-4 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium text-gray-900">
                  {request.groupName}
                </h4>
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
        {groupRequests.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500">No group requests</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        </div>

        {/* Group Requests Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Group Requests
          </h2>
          {renderGroupRequests()}
        </div>

        {/* Mentorship Requests Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mentorship Requests
          </h2>
          {user?.role === UserRole.Mentor ? (
            // Mentor View
            <div>
              {mentorshipRequests.map((request) => (
                <div
                  key={`mentorship-${request.id}`}
                  className="mb-4 bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-gray-900">
                        Student: {request.student.firstName}{" "}
                        {request.student.lastName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Duration: {request.duration}
                      </p>
                      {request.message && (
                        <p className="text-sm text-gray-600 mt-2">
                          Message: {request.message}
                        </p>
                      )}
                    </div>
                    {renderMentorshipActions(request)}
                  </div>
                </div>
              ))}
              {mentorshipRequests.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <p className="text-gray-500">No mentorship requests</p>
                </div>
              )}
            </div>
          ) : (
            // Student View
            <div>
              {mentorshipRequests.map((request) => (
                <div
                  key={`mentorship-${request.id}`}
                  className="mb-4 bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-gray-900">
                        Mentor: {request.mentor.firstName}{" "}
                        {request.mentor.lastName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Duration: {request.duration}
                      </p>
                      {request.message && (
                        <p className="text-sm text-gray-600 mt-2">
                          Message: {request.message}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getMentorshipStatusColor(
                        request.status
                      )}`}>
                      {getMentorshipStatusText(request.status)}
                    </span>
                  </div>
                </div>
              ))}
              {mentorshipRequests.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <p className="text-gray-500">No mentorship requests</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
