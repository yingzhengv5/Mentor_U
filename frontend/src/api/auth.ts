import axios from "axios";
import {
  LoginFormData,
  RegisterFormData,
  AuthResponse,
  EnumValue,
} from "@/interfaces/auth";

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5066/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authApi = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  getJobTitles: async (): Promise<EnumValue[]> => {
    const response = await api.get<EnumValue[]>("/enum/job-titles");
    return response.data;
  },

  getTechSkills: async (): Promise<EnumValue[]> => {
    const response = await api.get<EnumValue[]>("/enum/tech-skills");
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthResponse["user"]> => {
    const response = await api.get<AuthResponse["user"]>("/auth/me");
    return response.data;
  },
};
