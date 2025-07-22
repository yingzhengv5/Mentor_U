"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useMentorship } from "@/contexts/MentorshipContext";
import { UserRole } from "@/interfaces/auth";
import { MentorshipStatus, Mentorship } from "@/interfaces/mentorship";
import { mentorshipApi } from "@/api/mentorship";

export default function MentorshipsPage() {
  const { user } = useAuth();
  const { mentorships, isLoading, refreshMentorships } = useMentorship();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleMentorshipAction = async (
    mentorshipId: string,
    action: "complete" | "cancel"
  ) => {
    try {
      if (action === "complete") {
        await mentorshipApi.completeMentorship(mentorshipId);
      } else {
        await mentorshipApi.cancelMentorship(mentorshipId);
      }
      await refreshMentorships();
    } catch (err) {
      console.error(`Error ${action}ing mentorship:`, err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert(`Failed to ${action} mentorship. Please try again.`);
      }
    }
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

  const renderMentorshipCard = (mentorship: Mentorship) => {
    const isStudent = user?.role === UserRole.Student;
    const partner = isStudent ? mentorship.mentor : mentorship.student;

    return (
      <div
        key={mentorship.id}
        className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Card Header - Status Banner */}
        <div
          className={`px-6 py-2 ${getMentorshipStatusColor(
            mentorship.status
          )}`}>
          <span className="text-sm font-medium">
            {getMentorshipStatusText(mentorship.status)}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* Partner Info Section */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="relative w-16 h-16 flex-shrink-0">
              <img
                src={partner.profileImageUrl || "/default-avatar.png"}
                alt={`${partner.firstName} ${partner.lastName}`}
                className="rounded-full w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isStudent ? "Mentor" : "Student"}: {partner.firstName}{" "}
                {partner.lastName}
              </h3>
              <p className="text-sm text-gray-500">{partner.email}</p>
              {isStudent && mentorship.mentor.currentJobTitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {mentorship.mentor.currentJobTitle.name}
                </p>
              )}
            </div>
          </div>

          {/* Mentorship Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-sm text-gray-900">
                {mentorship.duration === 0
                  ? "1 Month"
                  : mentorship.duration === 1
                  ? "2 Months"
                  : "3 Months"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Start Date</p>
              <p className="text-sm text-gray-900">
                {new Date(mentorship.startDate).toLocaleDateString()}
              </p>
            </div>
            {mentorship.endDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <p className="text-sm text-gray-900">
                  {new Date(mentorship.endDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Skills Section - Only show for mentor */}
          {isStudent &&
            mentorship.mentor.skills &&
            mentorship.mentor.skills.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-2">
                  Mentor Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {mentorship.mentor.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Message Section */}
          {mentorship.message && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500 mb-2">Message</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {mentorship.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {mentorship.status === MentorshipStatus.Active && (
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  handleMentorshipAction(mentorship.id, "complete")
                }
                className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                Complete
              </button>
              <button
                onClick={() => handleMentorshipAction(mentorship.id, "cancel")}
                className="flex-1 px-4 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-md hover:bg-red-200 transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Mentorships</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentorships.map(renderMentorshipCard)}
        </div>

        {mentorships.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">No mentorships found</p>
          </div>
        )}
      </div>
    </div>
  );
}
