import { CreateGroupDto, GroupDto, GroupMemberDto } from "@/interfaces/group";
import api from "@/utils/api";

export const groupsApi = {
  // Create a new group
  createGroup: async (data: CreateGroupDto): Promise<GroupDto> => {
    const response = await api.post<GroupDto>("/group", data);
    return response.data;
  },

  // Get all available groups (public endpoint)
  getAllGroups: async (): Promise<GroupDto[]> => {
    const response = await api.get<GroupDto[]>("/group/all", {
      withCredentials: false,
    });
    return response.data;
  },

  // Get a specific group by ID (public endpoint)
  getGroup: async (id: string): Promise<GroupDto> => {
    const response = await api.get<GroupDto>(`/group/${id}`, {
      withCredentials: false,
    });
    return response.data;
  },

  // Get all groups for the current user
  getMyGroups: async (): Promise<GroupDto[]> => {
    const response = await api.get<GroupDto[]>("/group/my");
    return response.data;
  },

  // Request to join a group
  joinGroup: async (groupId: string): Promise<GroupMemberDto> => {
    const response = await api.post<GroupMemberDto>(`/group/${groupId}/join`);
    return response.data;
  },

  // Respond to a join request (accept/reject)
  respondToJoinRequest: async (
    groupId: string,
    userId: string,
    accept: boolean
  ): Promise<GroupMemberDto> => {
    const response = await api.put<GroupMemberDto>(
      `/group/${groupId}/members/${userId}`,
      null,
      {
        params: { accept },
      }
    );
    return response.data;
  },

  // Leave a group
  leaveGroup: async (groupId: string): Promise<void> => {
    await api.post(`/group/${groupId}/leave`);
  },

  // Delete (disband) a group
  deleteGroup: async (groupId: string): Promise<void> => {
    await api.delete(`/group/${groupId}`);
  },
};
