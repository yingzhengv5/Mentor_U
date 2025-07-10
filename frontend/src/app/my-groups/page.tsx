"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { groupsApi } from "@/api/groups";
import { GroupDto } from "@/interfaces/group";

export default function MyGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyGroups = async () => {
      try {
        const response = await groupsApi.getMyGroups();
        setGroups(response);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching groups:", error);
        setIsLoading(false);
      }
    };

    fetchMyGroups();
  }, []);

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await groupsApi.leaveGroup(groupId);
      // Update local state to reflect the change
      setGroups(groups.filter((group) => group.id !== groupId));
    } catch (error) {
      console.error("Error leaving group:", error);
      alert("Failed to leave group. Please try again.");
    }
  };

  const handleDisbandGroup = async (groupId: string) => {
    try {
      await groupsApi.deleteGroup(groupId);
      // Update local state to reflect the change
      setGroups(groups.filter((group) => group.id !== groupId));
    } catch (error) {
      console.error("Error disbanding group:", error);
      alert("Failed to disband group. Please try again.");
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Groups</h1>

        {groups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-600">
              You haven&apos;t joined any groups yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {group.name}
                </h3>
                <p className="text-gray-600 mb-4">{group.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {group.members.length} members
                  </span>
                  <div className="space-x-2">
                    {/* Group Chat button - to be implemented later */}
                    <button
                      className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200 transition-colors"
                      onClick={() =>
                        console.log("Open chat for group:", group.id)
                      }>
                      Group Chat
                    </button>
                    {group.creatorId === user?.id ? (
                      <button
                        onClick={() => handleDisbandGroup(group.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                        Disband Group
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLeaveGroup(group.id)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                        Leave Group
                      </button>
                    )}
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
