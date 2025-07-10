"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { groupsApi } from "@/api/groups";
import { GroupDto, RequestStatus } from "@/interfaces/group";
import Link from "next/link";

export default function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState<GroupDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch groups data
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await groupsApi.getAllGroups();
        setGroups(response);
        setFilteredGroups(response);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching groups:", error);
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = groups.filter(
      (group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredGroups(filtered);
  }, [searchQuery, groups]);

  // Check if user has joined a group
  const hasJoinedGroup = (group: GroupDto) => {
    if (!user) return false;
    return group.members.some(
      (member) =>
        member.userId === user.id && member.status === RequestStatus.Accepted
    );
  };

  // Handle join group
  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "/auth/login";
      return;
    }

    try {
      await groupsApi.joinGroup(groupId);
      // Show success message to user
      alert("Join request sent successfully!");
      // Refresh groups to update the UI
      const updatedGroups = await groupsApi.getAllGroups();
      setGroups(updatedGroups);
      setFilteredGroups(updatedGroups);
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

    if (user.id === group.creatorId) {
      return (
        <button
          className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md cursor-not-allowed"
          disabled>
          Owner
        </button>
      );
    }

    if (hasJoinedGroup(group)) {
      return (
        <button
          className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md cursor-not-allowed"
          disabled>
          Joined
        </button>
      );
    }

    return (
      <button
        onClick={() => handleJoinGroup(group.id)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
        Join Group
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
      </div>

      {/* Groups Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Groups</h2>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Carousel
            showArrows={true}
            showThumbs={false}
            infiniteLoop={true}
            autoPlay={true}
            interval={5000}
            showStatus={false}
            className="group-carousel">
            {groups.map((group) => (
              <div key={group.id} className="p-4">
                <div className="bg-white rounded-lg shadow-sm p-6 text-left">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {group.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{group.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">
                        {group.members.length} members
                      </span>
                      <span className="text-sm text-gray-500">
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
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Search Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {group.name}
                </h3>
                <p className="text-gray-600 mb-4">{group.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">
                      {group.members.length} members
                    </span>
                    <span className="text-sm text-gray-500">
                      Created by {group.creator.firstName}{" "}
                      {group.creator.lastName}
                    </span>
                  </div>
                  {renderActionButton(group)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
