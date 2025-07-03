"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();

  // State to track whether we've scrolled past a certain point
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Function to handle scroll events
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
    };

    // Add scroll listener when component mounts
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      // Dynamic classes based on scroll position
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300 ease-in-out
        ${
          isScrolled
            ? "bg-white shadow-lg" // When scrolled
            : "bg-transparent" // When at top
        }
      `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Home link */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              MentorU
            </Link>
          </div>
          {/* Navigation links */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700">Hi, {user?.firstName}</span>
                <button
                  onClick={logout}
                  className="bg-indigo-200 text-white px-4 py-2 rounded-md hover:bg-indigo-300 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="bg-gray-200 text-gray-700 px-3 py-2 hover:bg-gray-300 rounded-md transition-colors">
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
