import {
  LoginFormData,
  RegisterFormData,
  AuthResponse,
  EnumDto,
} from "@/interfaces/auth";
import api from "@/utils/api";

export const authApi = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  getJobTitles: async (): Promise<EnumDto[]> => {
    const response = await api.get<EnumDto[]>("/enum/job-titles");
    return response.data;
  },

  getTechSkills: async (): Promise<EnumDto[]> => {
    const response = await api.get<EnumDto[]>("/enum/tech-skills");
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthResponse["user"]> => {
    const response = await api.get<AuthResponse["user"]>("/auth/me");
    return response.data;
  },
};
