import { UserDto } from "./auth";

export enum RequestStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
}

export interface CreateGroupDto {
  name: string;
  description: string;
}

export interface GroupMemberDto {
  userId: string;
  user: UserDto;
  status: RequestStatus;
  groupId?: string; // Optional for backward compatibility
  groupName?: string; // Optional for backward compatibility
  creatorName?: string; // Optional for showing group creator's name in notifications
}

export interface GroupDto {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creator: UserDto;
  members: GroupMemberDto[];
  createdAt: string;
}
