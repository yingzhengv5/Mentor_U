import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Hook to redirect authenticated users
export const useRedirectAuth = (
  redirectTo: string,
  whenAuth: boolean = true
) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (whenAuth ? isAuthenticated : !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, redirectTo, whenAuth, router]);
};
