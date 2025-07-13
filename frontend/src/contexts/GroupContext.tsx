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
  const [isLoading, setIsLoading] = useState(true);

  const refreshGroups = useCallback(async () => {
    try {
      const [allGroups, userGroups] = await Promise.all([
        groupsApi.getAllGroups(),
        user ? groupsApi.getMyGroups() : Promise.resolve([]),
      ]);

      setGroups(allGroups);
      setMyGroups(userGroups);

      // Get pending requests for groups where user is creator
      if (user) {
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
        const response = await groupsApi.joinGroup(groupId);

        // Update the groups state immediately
        setGroups((prevGroups) =>
          prevGroups.map((group) => {
            if (group.id === groupId) {
              return {
                ...group,
                members: [...group.members, response],
              };
            }
            return group;
          })
        );

        // Then refresh all data
        await refreshGroups();
      } catch (error) {
        console.error("Error joining group:", error);
        throw error;
      }
    },
    [user, refreshGroups]
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
      const member = group.members.find((m) => m.userId === user.id);

      return {
        status: member?.status || null,
        isCreator,
      };
    },
    [user, groups]
  );

  const totalPendingRequests = pendingRequests.length;

  return (
    <GroupContext.Provider
      value={{
        groups,
        myGroups,
        pendingRequests,
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
