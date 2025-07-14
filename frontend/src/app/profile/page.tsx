// Profile page component to display and manage user information
// Uses AuthContext to access user data
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/interfaces/auth";
import { useRouter } from "next/navigation";

// Main Profile Page Component
export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  // If no user is logged in, redirect to login page
  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 sm:px-6 lg:px-8">
      {/* Container for profile content */}
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header Section */}
        <div className="px-4 py-5 sm:px-6 bg-[#fff8e1]">
          <h3 className="text-lg leading-6 font-medium text-gray-800">
            Profile Information
          </h3>
        </div>

        {/* Profile Information Grid */}
        <div className="border-t border-gray-200">
          <dl>
            {/* Name Section */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.firstName} {user.lastName}
              </dd>
            </div>

            {/* Email Section */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.email}
              </dd>
            </div>

            {/* Role Section */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.role === 0 ? "Student" : "Mentor"}
              </dd>
            </div>

            {/* Skills Section - Only show if user has skills */}
            {user.skills && user.skills.length > 0 && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Skills</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
            )}

            {/* Job Title Section - Only show if user has a current job title */}
            {user.currentJobTitle && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  {user.role === UserRole.Mentor
                    ? "Current Job"
                    : "Looking for a role"}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {user.currentJobTitle.name}
                  </span>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Actions Section */}
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
