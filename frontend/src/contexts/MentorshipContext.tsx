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
  mentorships: Mentorship[];
  recommendations: MentorRecommendation[];
  pendingRequests: Mentorship[];
  myRequests: Mentorship[];
  totalPendingRequests: number;
  isLoading: boolean;
  requestMentorship: (
    mentorId: string,
    message?: string,
    duration?: MentorshipDuration
  ) => Promise<void>;
  respondToRequest: (mentorshipId: string, accept: boolean) => Promise<void>;
  refreshMentorships: () => Promise<void>;
  getMentorshipStatus: (mentorId: string) => MentorshipStatus | undefined;
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

      // Immediately update local state
      setMentorships((prev) => [...prev, response]);

      // Show success notification
      alert("Mentorship request sent successfully!");

      // Refresh to ensure consistency
      await loadMentorships();
    } catch (error) {
      console.error("Error requesting mentorship:", error);
      throw error;
    }
  };

  const respondToRequest = async (mentorshipId: string, accept: boolean) => {
    try {
      await mentorshipApi.respondToRequest(mentorshipId, accept);
      await loadMentorships();
    } catch (error) {
      console.error("Error responding to request:", error);
      throw error;
    }
  };

  const refreshMentorships = async () => {
    await loadMentorships();
  };

  // Get mentorship status for a specific mentor
  const getMentorshipStatus = useCallback(
    (mentorId: string) => {
      if (!user) return undefined;

      const mentorship = mentorships.find(
        (m) => m.mentor.id === mentorId && m.student.id === user.id
      );
      return mentorship?.status;
    },
    [mentorships, user]
  );

  // Filter mentorships based on user role and status
  const pendingRequests = useMemo(() => {
    if (!user) return [];
    return mentorships.filter(
      (m) =>
        m.status === MentorshipStatus.Pending &&
        (user.role === UserRole.Mentor ? m.mentor.id === user.id : false)
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

  // Calculate total pending requests
  const totalPendingRequests = useMemo(() => {
    if (!user) return 0;
    if (user.role === UserRole.Mentor) {
      // For mentors: count pending requests they need to respond to
      return mentorships.filter(
        (m) => m.status === MentorshipStatus.Pending && m.mentor.id === user.id
      ).length;
    } else {
      // For students: count their own pending requests
      return mentorships.filter(
        (m) => m.status === MentorshipStatus.Pending && m.student.id === user.id
      ).length;
    }
  }, [mentorships, user]);

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
