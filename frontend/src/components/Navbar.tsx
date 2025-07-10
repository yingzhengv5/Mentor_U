"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { UserRole } from "@/interfaces/auth";
import { groupsApi } from "@/api/groups";
import CreateGroupForm from "./forms/CreateGroupForm";
import NotificationDropdown from "./NotificationDropdown";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

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

  // Handle group creation
  const handleCreateGroup = async (name: string, description: string) => {
    try {
      await groupsApi.createGroup({ name, description });
      setIsCreateGroupOpen(false);
      // Show success message
      alert("Group created successfully!");
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group. Please try again.");
    }
  };

  // Handle join request responses
  const handleAcceptJoinRequest = async (requestId: string) => {
    try {
      // TODO: Implement API call to accept join request
      console.log("Accepting join request:", requestId);
    } catch (error) {
      console.error("Error accepting join request:", error);
    }
  };

  const handleRejectJoinRequest = async (requestId: string) => {
    try {
      // TODO: Implement API call to reject join request
      console.log("Rejecting join request:", requestId);
    } catch (error) {
      console.error("Error rejecting join request:", error);
    }
  };

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300 ease-in-out
        ${isScrolled ? "bg-white shadow-lg" : "bg-transparent"}
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
            {isAuthenticated && user ? (
              <>
                {/* Create Group Button - Only show for students */}
                {user.role === UserRole.Student && (
                  <button
                    onClick={() => setIsCreateGroupOpen(true)}
                    className="mr-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Create Group
                  </button>
                )}

                {/* Notifications */}
                <div className="mr-4">
                  <NotificationDropdown
                    onAccept={handleAcceptJoinRequest}
                    onReject={handleRejectJoinRequest}
                  />
                </div>

                {/* Profile Dropdown */}
                <Menu as="div" className="relative ml-3">
                  <Menu.Button className="flex items-center text-sm rounded-full hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      {user.firstName[0]}
                    </div>
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/profile"
                            className={`${
                              active ? "bg-gray-100" : ""
                            } block px-4 py-2 text-sm text-gray-700`}>
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/my-groups"
                            className={`${
                              active ? "bg-gray-100" : ""
                            } block px-4 py-2 text-sm text-gray-700`}>
                            My Groups
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } block w-full text-left px-4 py-2 text-sm text-gray-700`}>
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
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

      {/* Create Group Modal */}
      <CreateGroupForm
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onSubmit={handleCreateGroup}
      />
    </nav>
  );
}
