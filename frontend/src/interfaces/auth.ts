export enum UserRole {
  Student = 0,
  Mentor = 1,
}

export interface EnumValue {
  value: string;
  displayName: string;
}

// Form data types
export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  skills: string[];
  willingToLearnSkills?: string[];
  jobTitle: string[];
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
  };
}
