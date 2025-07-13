"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { groupsApi } from "@/api/groups";
import { GroupDto, RequestStatus } from "@/interfaces/group";

export default function MyGroups() {
  const router = useRouter();
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchMyGroups = async () => {
      try {
        const response = await groupsApi.getMyGroups();
        setGroups(response);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyGroups();
  }, [user, router]);

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to leave this group?")) {
      return;
    }

    try {
      await groupsApi.leaveGroup(groupId);
      setGroups(groups.filter((group) => group.id !== groupId));
    } catch (error) {
      console.error("Error leaving group:", error);
      alert("Failed to leave group. Please try again.");
    }
  };

  const handleDisbandGroup = async (groupId: string) => {
    if (
      !confirm(
        "Are you sure you want to disband this group? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await groupsApi.deleteGroup(groupId);
      setGroups(groups.filter((group) => group.id !== groupId));
    } catch (error) {
      console.error("Error disbanding group:", error);
      alert("Failed to disband group. Please try again.");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Groups</h1>

        {groups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">
              You haven&apos;t joined any groups yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-[#fff8e1] rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {group.name}
                </h3>
                <p className="text-gray-600 mb-4">{group.description}</p>
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {
                        group.members.filter(
                          (m) => m.status === RequestStatus.Accepted
                        ).length
                      }{" "}
                      members
                    </span>
                    <span className="text-sm text-gray-500">
                      Created by {group.creator.firstName}{" "}
                      {group.creator.lastName}
                    </span>
                  </div>
                  <div className="flex justify-end items-center space-x-2">
                    {/* Group Chat button - to be implemented later */}
                    <button
                      className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200 transition-colors"
                      onClick={() =>
                        console.log("Open chat for group:", group.id)
                      }>
                      Group Chat
                    </button>
                    {user.id === group.creatorId ? (
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
