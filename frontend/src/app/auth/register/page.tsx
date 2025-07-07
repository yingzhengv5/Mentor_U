"use client";

import { useState } from "react";
import { useRedirectAuth } from "@/hooks/useRedirectAuth";
import MentorRegisterForm from "@/components/forms/MentorRegisterForm";
import MenteeRegisterForm from "@/components/forms/MenteeRegisterForm";

export default function RegisterPage() {
  useRedirectAuth("/dashboard");

  const [role, setRole] = useState<"mentor" | "student">("student");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  role === "student"
                    ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}>
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("mentor")}
                className={`inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  role === "mentor"
                    ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}>
                Mentor
              </button>
            </div>
          </div>

          {role === "mentor" ? <MentorRegisterForm /> : <MenteeRegisterForm />}
        </div>
      </div>
    </div>
  );
}
