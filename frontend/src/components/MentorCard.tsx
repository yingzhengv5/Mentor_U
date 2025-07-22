"use client";

import { UserDto, SkillDto, UserRole } from "@/interfaces/auth";
import { MentorshipStatus } from "@/interfaces/mentorship";
import Image from "next/image";

interface MentorCardProps {
  mentor: UserDto;
  onRequestMentorship: () => void;
  currentUserRole?: UserRole;
  disabled?: boolean;
  disabledReason?: string;
  mentorshipStatus: {
    status: MentorshipStatus | null;
    hasActiveMentorship: boolean;
  };
}

export function MentorCard({
  mentor,
  onRequestMentorship,
  currentUserRole,
  disabled = false,
  disabledReason,
  mentorshipStatus,
}: MentorCardProps) {
  const { status, hasActiveMentorship } = mentorshipStatus;

  const getStatusText = (status: MentorshipStatus | null) => {
    if (!status) return "";

    const statusText = {
      [MentorshipStatus.Pending]: "Request Pending",
      [MentorshipStatus.Active]: "Request Mentorship",
      [MentorshipStatus.Completed]: "Mentorship Completed",
      [MentorshipStatus.Cancelled]: "Request Cancelled",
    };

    return statusText[status];
  };

  const getStatusButton = () => {
    // 如果已经存在任何状态的请求，禁用按钮
    if (mentorshipStatus.status !== null) {
      return (
        <button
          disabled
          className="mt-3 w-full px-3 py-1.5 rounded-md cursor-not-allowed text-sm bg-gray-100 text-gray-500">
          {getStatusText(mentorshipStatus.status)}
        </button>
      );
    }

    // If user is a mentor, don't show the button
    if (currentUserRole === UserRole.Mentor) {
      return null;
    }

    if (disabled || hasActiveMentorship || status !== null) {
      const buttonStyles = {
        [MentorshipStatus.Pending]: "bg-yellow-100 text-yellow-800", // 0
        [MentorshipStatus.Active]: "bg-gray-100 text-gray-600", // 1
        [MentorshipStatus.Completed]: "bg-gray-100 text-gray-600", // 2
        [MentorshipStatus.Cancelled]: "bg-red-100 text-red-800", // 3
      };

      const statusText = {
        [MentorshipStatus.Pending]: "Request Pending",
        [MentorshipStatus.Active]: "Request Mentorship",
        [MentorshipStatus.Completed]: "Mentorship Completed",
        [MentorshipStatus.Cancelled]: "Request Cancelled",
      };

      const currentStatus =
        status || (hasActiveMentorship ? MentorshipStatus.Active : null);

      return (
        <button
          disabled
          className={`mt-3 w-full px-3 py-1.5 rounded-md cursor-not-allowed text-sm ${
            currentStatus !== null
              ? buttonStyles[currentStatus]
              : "bg-gray-100 text-gray-500"
          }`}>
          {currentStatus !== null
            ? statusText[currentStatus]
            : disabledReason || "Active Mentorship with Another Mentor"}
        </button>
      );
    }

    // Default request button
    return (
      <button
        onClick={onRequestMentorship}
        className="mt-3 w-full px-3 py-1.5 rounded-md transition-colors text-sm bg-indigo-600 text-white hover:bg-indigo-700">
        Request Mentorship
      </button>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 relative">
      {/* Mentor Tag */}
      <div className="absolute top-2 right-2 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-medium">
        Mentor
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative w-12 h-12">
          <Image
            src={mentor.profileImageUrl || "/default-avatar.png"}
            alt={`${mentor.firstName} ${mentor.lastName}`}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-base font-semibold">
            {mentor.firstName} {mentor.lastName}
          </h3>
          {mentor.currentJobTitle && (
            <p className="text-gray-600 text-xs">
              {mentor.currentJobTitle.name}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2">
        <p className="text-gray-600 text-xs line-clamp-2">{mentor.bio || ""}</p>
      </div>

      <div className="mt-2">
        <h4 className="text-xs font-medium text-gray-900 mb-1">Skills</h4>
        <div className="flex flex-wrap gap-1">
          {mentor.skills?.map((skill: SkillDto) => (
            <span
              key={skill.id}
              className="bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 rounded-full">
              {skill.name}
            </span>
          ))}
          {(!mentor.skills || mentor.skills.length === 0) && (
            <span className="text-gray-500 text-xs">No skills listed</span>
          )}
        </div>
      </div>

      {getStatusButton()}
    </div>
  );
}
