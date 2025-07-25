"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { mentorshipApi } from "@/api/mentorship";
import {
  Mentorship,
  MentorRecommendation,
  MentorshipDuration,
  MentorshipStatus,
} from "@/interfaces/mentorship";
import { useAuth } from "./AuthContext";
import { UserRole, UserDto } from "@/interfaces/auth";

interface MentorshipContextType {
  mentors: UserDto[];
  mentorships: Mentorship[]; // Requests waiting for mentor's response
  recommendations: MentorRecommendation[];
  pendingRequests: Mentorship[];
  myRequests: Mentorship[]; // Student's sent requests or mentor's received requests
  totalPendingRequests: number;
  isLoading: boolean;
  requestMentorship: (
    mentorId: string,
    message?: string,
    duration?: MentorshipDuration
  ) => Promise<void>;
  respondToRequest: (mentorshipId: string, accept: boolean) => Promise<void>;
  refreshMentorships: () => Promise<void>;
  getMentorshipStatus: (mentorId: string) => {
    status: MentorshipStatus | null;
    hasActiveMentorship: boolean;
  };
  cancelMentorship: (mentorId: string) => Promise<void>;
  completeMentorship: (mentorId: string) => Promise<void>;
}

const MentorshipContext = createContext<MentorshipContextType | undefined>(
  undefined
);

export function MentorshipProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<UserDto[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [recommendations, setRecommendations] = useState<
    MentorRecommendation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load public data (mentors) immediately
  useEffect(() => {
    loadMentors();
  }, []);

  // Load user-specific data only when logged in
  useEffect(() => {
    if (user) {
      loadMentorships();
      if (user.role === UserRole.Student) {
        loadRecommendations();
      }
    }
  }, [user]);

  const loadMentors = async () => {
    try {
      const mentorsData = await mentorshipApi.getAllMentors();
      setMentors(mentorsData);
    } catch (error) {
      console.error("Error loading mentors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMentorships = async () => {
    try {
      const mentorshipsData = await mentorshipApi.getCurrentMentorships();
      setMentorships(mentorshipsData);
    } catch (error) {
      console.error("Error loading mentorships:", error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const recommendationsData = await mentorshipApi.getRecommendations();
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error("Error loading recommendations:", error);
    }
  };

  const requestMentorship = async (
    mentorId: string,
    message?: string,
    duration: MentorshipDuration = MentorshipDuration.ThreeMonths
  ) => {
    try {
      const response = await mentorshipApi.requestMentorship({
        mentorId,
        message,
        duration,
      });

      setMentorships((prev) => [...prev, response]);

      alert("Mentorship request sent successfully!");
    } catch (error) {
      console.error("Error requesting mentorship:", error);
      await loadMentorships();
      throw error;
    }
  };

  // When one mentorship become active, delete this student's other pending request
  const respondToRequest = async (mentorshipId: string, accept: boolean) => {
    try {
      const response = await mentorshipApi.respondToRequest(
        mentorshipId,
        accept
      );

      if (accept && response.status === MentorshipStatus.Active) {
        await mentorshipApi.deletePendingRequests(response.student.id);
      }

      await loadMentorships();
    } catch (error) {
      console.error("Error responding to request:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Failed to respond to request. Please try again.");
      }
      throw error;
    }
  };

  const refreshMentorships = async () => {
    await loadMentorships();
  };

  // Get mentorship status to determine the button state for each mentor card
  const getMentorshipStatus = useCallback(
    (mentorId: string) => {
      if (!user) {
        return { status: null, hasActiveMentorship: false };
      }

      // Check if user has any active mentorship
      const hasActiveMentorship = mentorships.some(
        (m) => m.student.id === user.id && m.status === MentorshipStatus.Active
      );

      // Find specific mentorship with this mentor
      const mentorship = mentorships.find(
        (m) => m.mentor.id === mentorId && m.student.id === user.id
      );

      return {
        status: mentorship?.status || null,
        hasActiveMentorship,
      };
    },
    [user, mentorships]
  );

  // Add function to handle cancellation
  const cancelMentorship = async (mentorshipId: string) => {
    try {
      await mentorshipApi.cancelMentorship(mentorshipId);
      setMentorships((prev) =>
        prev.map((m) =>
          m.id === mentorshipId
            ? {
                ...m,
                status: MentorshipStatus.Cancelled,
              }
            : m
        )
      );

      await loadMentorships();
    } catch (error) {
      console.error("Error cancelling mentorship:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Failed to cancel mentorship. Please try again.");
      }
      throw error;
    }
  };

  const completeMentorship = async (mentorshipId: string) => {
    try {
      await mentorshipApi.completeMentorship(mentorshipId);

      setMentorships((prev) =>
        prev.map((m) =>
          m.id === mentorshipId
            ? {
                ...m,
                status: MentorshipStatus.Completed,
              }
            : m
        )
      );

      await loadMentorships();
    } catch (error) {
      console.error("Error completing mentorship:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Failed to complete mentorship. Please try again.");
      }
      throw error;
    }
  };

  // Filter mentorships based on user role and status
  const pendingRequests = useMemo(() => {
    if (!user || user.role !== UserRole.Mentor) return [];
    // 只有 Mentor 才应该看到 pending requests
    return mentorships.filter(
      (m) => m.mentor.id === user.id && m.status === MentorshipStatus.Pending
    );
  }, [mentorships, user]);

  const myRequests = useMemo(() => {
    if (!user) return [];
    return mentorships.filter((m) =>
      user.role === UserRole.Student
        ? m.student.id === user.id
        : m.mentor.id === user.id
    );
  }, [mentorships, user]);

  // Calculate total pending requests (only for mentors)
  const totalPendingRequests = useMemo(() => {
    if (!user || user.role !== UserRole.Mentor) return 0;
    return pendingRequests.length;
  }, [user, pendingRequests]);

  return (
    <MentorshipContext.Provider
      value={{
        mentors,
        mentorships,
        recommendations,
        pendingRequests,
        myRequests,
        totalPendingRequests,
        isLoading,
        requestMentorship,
        respondToRequest,
        refreshMentorships,
        getMentorshipStatus,
        cancelMentorship,
        completeMentorship,
      }}>
      {children}
    </MentorshipContext.Provider>
  );
}

export const useMentorship = () => {
  const context = useContext(MentorshipContext);
  if (context === undefined) {
    throw new Error("useMentorship must be used within a MentorshipProvider");
  }
  return context;
};
