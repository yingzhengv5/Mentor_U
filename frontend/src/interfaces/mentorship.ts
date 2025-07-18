import { UserRole } from "./auth";
import { UserDto } from "./auth";

export enum MentorshipStatus {
  Pending = "Pending",
  Active = "Active",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export enum MentorshipDuration {
  OneMonth = 0,
  TwoMonths = 1,
  ThreeMonths = 2,
}

export interface MentorshipRequest {
  mentorId: string;
  message?: string;
  duration: MentorshipDuration;
}

export interface Mentorship {
  id: string;
  mentor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    bio?: string;
    profileImageUrl?: string;
    skills: string[];
    currentJobTitle?: string;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
  status: MentorshipStatus;
  duration: MentorshipDuration;
  startDate: string;
  endDate: string;
  message?: string;
}

export interface MentorRecommendation {
  mentor: UserDto;
  matchScore: number;
  matchingSkills: string[];
  additionalSkills: string[];
  recommendationReason: string;
}
