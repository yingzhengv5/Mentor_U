"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { GroupDto, GroupMemberDto, RequestStatus } from "@/interfaces/group";
import { groupsApi } from "@/api/groups";
import { useAuth } from "./AuthContext";

interface GroupContextType {
  groups: GroupDto[];
  myGroups: GroupDto[];
  pendingRequests: GroupMemberDto[];
  myRequests: GroupMemberDto[]; // Track user's own requests
  isLoading: boolean;
  joinGroup: (groupId: string) => Promise<void>;
  approveRequest: (groupId: string, userId: string) => Promise<void>;
  rejectRequest: (groupId: string, userId: string) => Promise<void>;
  getUserGroupStatus: (groupId: string) => {
    status: RequestStatus | null;
    isCreator: boolean;
  };
  refreshGroups: () => Promise<void>;
  totalPendingRequests: number;
}

const GroupContext = createContext<GroupContextType>({
  groups: [],
  myGroups: [],
  pendingRequests: [],
  myRequests: [],
  isLoading: true,
  joinGroup: async () => {},
  approveRequest: async () => {},
  rejectRequest: async () => {},
  getUserGroupStatus: () => ({ status: null, isCreator: false }),
  refreshGroups: async () => {},
  totalPendingRequests: 0,
});

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
};

export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [myGroups, setMyGroups] = useState<GroupDto[]>([]);
  const [pendingRequests, setPendingRequests] = useState<GroupMemberDto[]>([]);
  const [myRequests, setMyRequests] = useState<GroupMemberDto[]>([]); // Add this
  const [isLoading, setIsLoading] = useState(true);

  const refreshGroups = useCallback(async () => {
    try {
      const [allGroups, userGroups] = await Promise.all([
        groupsApi.getAllGroups(),
        user ? groupsApi.getMyGroups() : Promise.resolve([]),
      ]);

      setGroups(allGroups);
      setMyGroups(userGroups);

      if (user) {
        // Get pending requests for groups where user is creator
        const createdGroups = allGroups.filter(
          (group) => group.creatorId === user.id
        );
        const requests = createdGroups.flatMap((group) =>
          group.members
            .filter((member) => member.status === RequestStatus.Pending)
            .map((member) => ({
              ...member,
              groupId: group.id,
              groupName: group.name,
            }))
        );
        setPendingRequests(requests);

        // Get all requests made by the current user
        const userRequests = allGroups.flatMap((group) =>
          group.members
            .filter((member) => member.userId === user.id)
            .map((member) => ({
              ...member,
              groupId: group.id,
              groupName: group.name,
              creatorName: `${group.creator.firstName} ${group.creator.lastName}`,
            }))
        );
        setMyRequests(userRequests);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshGroups();
  }, [refreshGroups]);

  const joinGroup = useCallback(
    async (groupId: string) => {
      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      try {
        // Find the group
        const group = groups.find((g) => g.id === groupId);
        if (!group) {
          throw new Error("Group not found");
        }

        const newMember = {
          userId: user.id,
          user: user,
          status: RequestStatus.Pending,
          groupId: group.id,
          groupName: group.name,
          creatorName: `${group.creator.firstName} ${group.creator.lastName}`,
        };

        // Immediately update the local states
        setGroups((prevGroups) =>
          prevGroups.map((g) => {
            if (g.id === groupId) {
              return {
                ...g,
                members: [...g.members, newMember],
              };
            }
            return g;
          })
        );

        setMyRequests((prev) => [...prev, newMember]);

        // Make the API call
        await groupsApi.joinGroup(groupId);

        // Refresh all data to ensure consistency with server
        await refreshGroups();
      } catch (error) {
        console.error("Error joining group:", error);
        // If the API call fails, refresh the groups to restore the correct state
        await refreshGroups();
        throw error;
      }
    },
    [user, groups, refreshGroups]
  );

  const approveRequest = useCallback(
    async (groupId: string, userId: string) => {
      try {
        await groupsApi.respondToJoinRequest(groupId, userId, true);
        await refreshGroups();
      } catch (error) {
        console.error("Error approving request:", error);
        throw error;
      }
    },
    [refreshGroups]
  );

  const rejectRequest = useCallback(
    async (groupId: string, userId: string) => {
      try {
        await groupsApi.respondToJoinRequest(groupId, userId, false);
        await refreshGroups();
      } catch (error) {
        console.error("Error rejecting request:", error);
        throw error;
      }
    },
    [refreshGroups]
  );

  const getUserGroupStatus = useCallback(
    (groupId: string) => {
      if (!user) return { status: null, isCreator: false };

      const group = groups.find((g) => g.id === groupId);
      if (!group) return { status: null, isCreator: false };

      const isCreator = group.creatorId === user.id;

      // First check in myRequests for the most up-to-date status
      const myRequest = myRequests.find((r) => r.groupId === groupId);
      if (myRequest) {
        return {
          status: myRequest.status,
          isCreator,
        };
      }

      // Fallback to checking group members
      const member = group.members.find((m) => m.userId === user.id);
      return {
        status: member?.status || null,
        isCreator,
      };
    },
    [user, groups, myRequests] // Add myRequests to dependencies
  );

  const totalPendingRequests = pendingRequests.length;

  return (
    <GroupContext.Provider
      value={{
        groups,
        myGroups,
        pendingRequests,
        myRequests,
        isLoading,
        joinGroup,
        approveRequest,
        rejectRequest,
        getUserGroupStatus,
        refreshGroups,
        totalPendingRequests,
      }}>
      {children}
    </GroupContext.Provider>
  );
};
