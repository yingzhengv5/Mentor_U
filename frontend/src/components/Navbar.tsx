"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import { useMentorship } from "@/contexts/MentorshipContext";
import { UserRole } from "@/interfaces/auth";
import CreateGroupForm from "./forms/CreateGroupForm";
import { groupsApi } from "@/api/groups";

export default function Navbar() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { totalPendingRequests: groupPendingRequests } = useGroup();
  const { totalPendingRequests: mentorshipPendingRequests } = useMentorship();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const totalPendingRequests = groupPendingRequests + mentorshipPendingRequests;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCreateGroup = async (name: string, description: string) => {
    try {
      await groupsApi.createGroup({ name, description });
      setIsCreateGroupOpen(false);
      router.push("/my-groups");
    } catch (err) {
      console.error("Error creating group:", err);
      alert(err instanceof Error ? err.message : "Failed to create group");
    }
  };

  if (authLoading) {
    return null;
  }

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Mentor U
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                Lobby
              </Link>
              {user?.role === UserRole.Student && (
                <button
                  onClick={() => setIsCreateGroupOpen(true)}
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Create Group
                </button>
              )}
            </div>
          </div>

          {/* Right side - Auth buttons or User menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications Icon */}
                <Link
                  href="/requests"
                  className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <span className="sr-only">View requests</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {totalPendingRequests > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
                      {totalPendingRequests}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600">
                    <span className="text-sm font-medium">
                      {user.firstName}
                    </span>
                    <svg
                      className={`h-5 w-5 transition-transform ${
                        isProfileOpen ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsProfileOpen(false)}>
                          Profile
                        </Link>
                        <Link
                          href="/my-groups"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsProfileOpen(false)}>
                          My Groups
                        </Link>
                        <Link
                          href="/mentorships"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsProfileOpen(false)}>
                          My Mentorships
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem">
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-indigo-600">
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupForm
        isOpen={isCreateGroupOpen}
        onClose={() => {
          setIsCreateGroupOpen(false);
        }}
        onSubmit={handleCreateGroup}
      />
    </nav>
  );
}
