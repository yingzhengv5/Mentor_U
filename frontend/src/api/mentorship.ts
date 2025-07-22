import api from "@/utils/api";
import axios from "axios";

import {
  Mentorship,
  MentorshipRequest,
  MentorRecommendation,
} from "@/interfaces/mentorship";

import { UserDto } from "@/interfaces/auth";

export const mentorshipApi = {
  // Get all mentors (public endpoint)
  getAllMentors: async (): Promise<UserDto[]> => {
    const response = await api.get<UserDto[]>("/mentorship/mentors", {
      withCredentials: false,
    });
    return response.data;
  },

  // Get mentor recommendations for current student
  getRecommendations: async (): Promise<MentorRecommendation[]> => {
    const response = await api.get<MentorRecommendation[]>(
      "/mentorship/recommendations"
    );
    return response.data;
  },

  // Request mentorship
  requestMentorship: async (
    request: MentorshipRequest
  ): Promise<Mentorship> => {
    try {
      console.log("Sending mentorship request:", request); // Debug log
      const response = await api.post<Mentorship>("/mentorship/request", {
        mentorId: request.mentorId,
        message: request.message,
        duration: request.duration, // Already a number (0, 1, or 2)
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          config: error.config,
        });
        if (error.response?.status === 400) {
          throw new Error(
            `Bad request: ${JSON.stringify(error.response.data)}`
          );
        }
        if (error.response?.status === 401) {
          throw new Error("Unauthorized: Please log in again");
        }
      }
      throw error;
    }
  },

  // Respond to mentorship request
  respondToRequest: async (
    mentorshipId: string,
    accept: boolean
  ): Promise<Mentorship> => {
    try {
      const response = await api.post<Mentorship>(
        `/mentorship/${mentorshipId}/respond`,
        accept, // 直接发送 boolean 值，而不是包装在对象中
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          config: error.config,
        });
        if (error.response?.status === 400) {
          throw new Error(
            `Bad request: ${JSON.stringify(error.response.data)}`
          );
        }
        if (error.response?.status === 401) {
          throw new Error("Unauthorized: Please log in again");
        }
      }
      throw error;
    }
  },

  cancelMentorship: async (mentorshipId: string): Promise<void> => {
    await api.post(`/mentorship/${mentorshipId}/cancel`);
  },

  getPendingRequests: async (): Promise<Mentorship[]> => {
    const response = await api.get<Mentorship[]>("/mentorship/pending");
    return response.data;
  },

  // Get current user's mentorships
  getCurrentMentorships: async (): Promise<Mentorship[]> => {
    const response = await api.get<Mentorship[]>("/mentorship/current");
    return response.data;
  },
};
