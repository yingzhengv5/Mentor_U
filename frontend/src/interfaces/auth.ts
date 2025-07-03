export enum UserRole {
  Student = 0,
  Mentor = 1,
}

export interface SkillDto {
  id: string;
  name: string;
}

export interface JobTitleDto {
  id: string;
  name: string;
}

// Form data types
export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  bio?: string;
  profileImageUrl?: string;
  skillIds: string[];
  willingToLearnSkillIds?: string[]; // Only for students
  jobTitleId: string; // Current role for mentors, desired role for students
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    bio?: string;
    profileImageUrl?: string;
    skills: SkillDto[];
    willingToLearnSkills?: SkillDto[];
    currentJobTitle?: JobTitleDto;
  };
}

// API response types
export interface EnumDto {
  id: string;
  name: string;
}
