import { UserDto } from "./auth";

export enum RequestStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Rejected = "Rejected",
}

export interface CreateGroupDto {
  name: string;
  description: string;
}

export interface GroupMemberDto {
  userId: string;
  user: UserDto;
  status: RequestStatus;
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
