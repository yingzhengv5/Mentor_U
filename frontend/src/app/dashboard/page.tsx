"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { GroupDto, RequestStatus } from "@/interfaces/group";
import Link from "next/link";
import { useMentorship } from "@/contexts/MentorshipContext";
import { MentorCard } from "@/components/MentorCard";
import { UserDto, UserRole } from "@/interfaces/auth";
import { useRouter } from "next/navigation";
import { RequestMentorshipModal } from "@/components/RequestMentorshipModal";
import { MentorshipStatus, MentorshipDuration } from "@/interfaces/mentorship";

export default function Dashboard() {
  const { user } = useAuth();
  const {
    groups,
    isLoading: groupsLoading,
    joinGroup,
    getUserGroupStatus,
  } = useGroup();
  const {
    mentors = [],
    recommendations = [],
    mentorships = [],
    isLoading: mentorsLoading,
    requestMentorship,
    getMentorshipStatus,
  } = useMentorship();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState<GroupDto[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<UserDto[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<UserDto | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const router = useRouter();

  // Check if user has active mentorship
  const hasActiveMentorship = useMemo(() => {
    return mentorships.some((m) => m.status === MentorshipStatus.Active);
  }, [mentorships]);

  // Handle search for both groups and mentors
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    // Filter groups
    const matchedGroups = groups.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query)
    );
    setFilteredGroups(matchedGroups);

    // Filter mentors
    const matchedMentors = mentors.filter(
      (mentor) =>
        mentor.firstName.toLowerCase().includes(query) ||
        mentor.lastName.toLowerCase().includes(query) ||
        mentor.currentJobTitle?.name.toLowerCase().includes(query) ||
        mentor.skills?.some((skill) => skill.name.toLowerCase().includes(query))
    );
    setFilteredMentors(matchedMentors);
  }, [searchQuery, groups, mentors]);

  // Handle join group
  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup(groupId);
      alert("Join request sent successfully!");
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Failed to send join request. Please try again.");
    }
  };

  // Render join/action button based on user state
  const renderActionButton = (group: GroupDto) => {
    if (!user) {
      return (
        <Link
          href="/auth/login"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
          Login to Join
        </Link>
      );
    }

    const { status, isCreator } = getUserGroupStatus(group.id);

    if (isCreator) {
      return (
        <button
          className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md cursor-not-allowed"
          disabled>
          Owner
        </button>
      );
    }

    switch (status) {
      case RequestStatus.Pending:
        return (
          <button
            className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md cursor-not-allowed"
            disabled>
            Request Pending
          </button>
        );

      case RequestStatus.Accepted:
        return (
          <button
            className="bg-green-100 text-green-800 px-4 py-2 rounded-md cursor-not-allowed"
            disabled>
            Joined
          </button>
        );

      case RequestStatus.Rejected:
        return (
          <button
            className="bg-red-100 text-red-800 px-4 py-2 rounded-md cursor-not-allowed"
            disabled>
            Request Rejected
          </button>
        );

      default:
        return (
          <button
            onClick={() => handleJoinGroup(group.id)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            Join Group
          </button>
        );
    }
  };

  const handleRequestMentorship = async (
    message: string,
    duration: MentorshipDuration
  ) => {
    if (!selectedMentor) return;
    try {
      await requestMentorship(selectedMentor.id, message, duration);
      setIsRequestModalOpen(false);
      setSelectedMentor(null);
    } catch (error) {
      console.error("Error requesting mentorship:", error);
      alert("Failed to send mentorship request. Please try again.");
    }
  };

  // Check if data is still loading
  if (groupsLoading || mentorsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {" "}
            {/* Add min-w-0 to prevent flex child from overflowing */}
            {/* Search Bar */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search groups and mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-0 focus:border-indigo-500 transition-colors"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            {/* Groups Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {searchQuery ? "Matching Groups" : "All Groups"}
              </h2>
              {!searchQuery ? (
                <Carousel
                  showArrows={true}
                  showThumbs={false}
                  infiniteLoop={true}
                  autoPlay={true}
                  interval={5000}
                  showStatus={false}
                  showIndicators={true}
                  className="group-carousel">
                  {groups.map((group) => (
                    <div key={group.id} className="px-2 pb-4">
                      <div className="bg-[#fff8e1] rounded-lg shadow-sm p-4 text-left">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {group.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500">
                              {
                                group.members.filter(
                                  (m) => m.status === RequestStatus.Accepted
                                ).length
                              }{" "}
                              members
                            </span>
                            <span className="text-xs text-gray-500">
                              Created by {group.creator.firstName}{" "}
                              {group.creator.lastName}
                            </span>
                          </div>
                          {renderActionButton(group)}
                        </div>
                      </div>
                    </div>
                  ))}
                </Carousel>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredGroups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-[#fff8e1] rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {group.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">
                            {
                              group.members.filter(
                                (m) => m.status === RequestStatus.Accepted
                              ).length
                            }{" "}
                            members
                          </span>
                          <span className="text-xs text-gray-500">
                            Created by {group.creator.firstName}{" "}
                            {group.creator.lastName}
                          </span>
                        </div>
                        {renderActionButton(group)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Mentors Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {searchQuery ? "Matching Mentors" : "Available Mentors"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {(searchQuery ? filteredMentors : mentors).map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    currentUserRole={user?.role}
                    mentorshipStatus={getMentorshipStatus(mentor.id)}
                    disabled={
                      user?.role === UserRole.Student && hasActiveMentorship
                    }
                    disabledReason={
                      hasActiveMentorship
                        ? "You already have an active mentorship"
                        : undefined
                    }
                    onRequestMentorship={() => {
                      if (!user) {
                        router.push("/auth/login");
                        return;
                      }
                      if (
                        hasActiveMentorship ||
                        getMentorshipStatus(mentor.id).status !== null
                      ) {
                        return;
                      }
                      setSelectedMentor(mentor);
                      setIsRequestModalOpen(true);
                    }}
                  />
                ))}
                {searchQuery && filteredMentors.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    No matching mentors found
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Recommendations */}
          {user?.role === UserRole.Student && (
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow p-4 lg:sticky lg:top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  Recommended Mentors
                </h2>
                <div className="space-y-3">
                  {Array.isArray(recommendations) &&
                    recommendations.map((rec) => (
                      <div
                        key={rec.mentor.id}
                        className="bg-indigo-50 rounded-lg p-3">
                        <MentorCard
                          mentor={rec.mentor}
                          currentUserRole={user?.role}
                          mentorshipStatus={getMentorshipStatus(rec.mentor.id)}
                          disabled={hasActiveMentorship}
                          disabledReason={
                            hasActiveMentorship
                              ? "You already have an active mentorship"
                              : undefined
                          }
                          onRequestMentorship={() => {
                            if (
                              hasActiveMentorship ||
                              getMentorshipStatus(rec.mentor.id).status !== null
                            ) {
                              return;
                            }
                            setSelectedMentor(rec.mentor);
                            setIsRequestModalOpen(true);
                          }}
                        />
                        <div className="mt-2">
                          <div className="text-xs text-gray-600">
                            <div className="font-medium">
                              Match Score: {Math.round(rec.matchScore * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  {(!recommendations || recommendations.length === 0) && (
                    <p className="text-gray-500 text-xs">
                      No recommendations available at this time.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Mentorship Modal */}
      <RequestMentorshipModal
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setSelectedMentor(null);
        }}
        onSubmit={handleRequestMentorship}
        mentor={selectedMentor}
      />
    </div>
  );
}
