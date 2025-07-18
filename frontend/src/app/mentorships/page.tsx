"use client";

import { useMentorship } from "@/contexts/MentorshipContext";
import { useAuth } from "@/contexts/AuthContext";
import { MentorshipStatus, MentorshipDuration } from "@/interfaces/mentorship";
import { UserRole } from "@/interfaces/auth";
import { useState } from "react";

export default function MentorshipsPage() {
  const { user } = useAuth();
  const { mentorships, isLoading, respondToRequest } = useMentorship();
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: MentorshipStatus) => {
    switch (status) {
      case MentorshipStatus.Active:
        return "bg-green-100 text-green-800";
      case MentorshipStatus.Pending:
        return "bg-yellow-100 text-yellow-800";
      case MentorshipStatus.Completed:
        return "bg-gray-100 text-gray-800";
      case MentorshipStatus.Cancelled:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDurationText = (duration: MentorshipDuration) => {
    switch (duration) {
      case MentorshipDuration.OneMonth:
        return "1 Month";
      case MentorshipDuration.TwoMonths:
        return "2 Months";
      case MentorshipDuration.ThreeMonths:
        return "3 Months";
      default:
        return duration;
    }
  };

  const handleStatusUpdate = async (mentorshipId: string, accept: boolean) => {
    try {
      setUpdateLoading(mentorshipId);
      await respondToRequest(mentorshipId, accept);
      setUpdateLoading(null);
    } catch (error) {
      console.error("Error updating mentorship status:", error);
      alert("Failed to update mentorship status. Please try again.");
      setUpdateLoading(null);
    }
  };

  // Filter mentorships based on status
  const activeMentorships = mentorships.filter(
    (m) => m.status === MentorshipStatus.Active
  );
  const pendingMentorships = mentorships.filter(
    (m) => m.status === MentorshipStatus.Pending
  );
  const completedMentorships = mentorships.filter(
    (m) =>
      m.status === MentorshipStatus.Completed ||
      m.status === MentorshipStatus.Cancelled
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          My Mentorships
        </h1>

        {mentorships.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">
              {user?.role === UserRole.Student
                ? "You haven't requested any mentorships yet."
                : "You haven't received any mentorship requests yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Mentorships Section */}
            {pendingMentorships.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
                <div className="grid gap-4">
                  {pendingMentorships.map((mentorship) => (
                    <div
                      key={mentorship.id}
                      className="bg-white rounded-lg shadow p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {user?.role === UserRole.Student
                              ? `Mentor: ${mentorship.mentor.firstName} ${mentorship.mentor.lastName}`
                              : `Student: ${mentorship.student.firstName} ${mentorship.student.lastName}`}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {mentorship.mentor.email}
                          </p>
                        </div>
                        <span
                          className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            mentorship.status
                          )}`}>
                          {mentorship.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-medium">
                            {getDurationText(mentorship.duration)}
                          </p>
                        </div>
                        {mentorship.message && (
                          <div className="sm:col-span-2">
                            <p className="text-gray-600">Message</p>
                            <p className="font-medium">{mentorship.message}</p>
                          </div>
                        )}
                      </div>

                      {/* Action buttons for mentor */}
                      {user?.role === UserRole.Mentor &&
                        mentorship.status === MentorshipStatus.Pending && (
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() =>
                                handleStatusUpdate(mentorship.id, true)
                              }
                              disabled={updateLoading === mentorship.id}
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50">
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(mentorship.id, false)
                              }
                              disabled={updateLoading === mentorship.id}
                              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50">
                              Decline
                            </button>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Mentorships Section */}
            {activeMentorships.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Active Mentorships
                </h2>
                <div className="grid gap-4">
                  {activeMentorships.map((mentorship) => (
                    <div
                      key={mentorship.id}
                      className="bg-white rounded-lg shadow p-6">
                      {/* ... Similar content as above ... */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {user?.role === UserRole.Student
                              ? `Mentor: ${mentorship.mentor.firstName} ${mentorship.mentor.lastName}`
                              : `Student: ${mentorship.student.firstName} ${mentorship.student.lastName}`}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {mentorship.mentor.email}
                          </p>
                        </div>
                        <span
                          className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            mentorship.status
                          )}`}>
                          {mentorship.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-medium">
                            {getDurationText(mentorship.duration)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Start Date</p>
                          <p className="font-medium">
                            {formatDate(mentorship.startDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">End Date</p>
                          <p className="font-medium">
                            {formatDate(mentorship.endDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() =>
                            handleStatusUpdate(mentorship.id, false)
                          }
                          disabled={updateLoading === mentorship.id}
                          className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50">
                          Complete
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(mentorship.id, false)
                          }
                          disabled={updateLoading === mentorship.id}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed/Cancelled Mentorships Section */}
            {completedMentorships.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Past Mentorships</h2>
                <div className="grid gap-4">
                  {completedMentorships.map((mentorship) => (
                    <div
                      key={mentorship.id}
                      className="bg-white rounded-lg shadow p-6">
                      {/* ... Similar content as above ... */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {user?.role === UserRole.Student
                              ? `Mentor: ${mentorship.mentor.firstName} ${mentorship.mentor.lastName}`
                              : `Student: ${mentorship.student.firstName} ${mentorship.student.lastName}`}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {mentorship.mentor.email}
                          </p>
                        </div>
                        <span
                          className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            mentorship.status
                          )}`}>
                          {mentorship.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-medium">
                            {getDurationText(mentorship.duration)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Start Date</p>
                          <p className="font-medium">
                            {formatDate(mentorship.startDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">End Date</p>
                          <p className="font-medium">
                            {formatDate(mentorship.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
