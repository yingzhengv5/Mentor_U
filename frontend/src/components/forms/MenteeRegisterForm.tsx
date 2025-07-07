"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/api/auth";
import { UserRole, EnumDto } from "@/interfaces/auth";

export default function MenteeRegisterForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    bio: "",
    skillIds: [] as string[],
    willingToLearnSkillIds: [] as string[],
    jobTitleId: "",
  });

  const [skills, setSkills] = useState<EnumDto[]>([]);
  const [jobTitles, setJobTitles] = useState<EnumDto[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsData, jobTitlesData] = await Promise.all([
          authApi.getTechSkills(),
          authApi.getJobTitles(),
        ]);
        setSkills(skillsData);
        setJobTitles(jobTitlesData);
      } catch (err) {
        setError("Failed to load form data");
        console.error("Failed to load form data:", err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authApi.register({
        ...formData,
        role: UserRole.Student,
      });
      login(response);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillChange = (skillId: string, isWillingToLearn: boolean) => {
    setFormData((prev) => {
      const field = isWillingToLearn ? "willingToLearnSkillIds" : "skillIds";
      return {
        ...prev,
        [field]: prev[field].includes(skillId)
          ? prev[field].filter((id) => id !== skillId)
          : [...prev[field], skillId],
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-2"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          required
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-2"
        />
      </div>

      <div>
        <label
          htmlFor="firstName"
          className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          required
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-2"
        />
      </div>

      <div>
        <label
          htmlFor="lastName"
          className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          required
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-2"
        />
      </div>

      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-2 min-h-[100px]"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Your Current Skills
        </label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-2"
          onChange={(e) => handleSkillChange(e.target.value, false)}
          value="">
          <option value=""></option>
          {skills
            .filter((skill) => !formData.skillIds.includes(skill.id))
            .map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
        </select>
        <div className="mt-2 flex flex-wrap gap-2 mb-3">
          {formData.skillIds.map((skillId) => {
            const skill = skills.find((s) => s.id === skillId);
            return skill ? (
              <div
                key={skill.id}
                className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center gap-2">
                <span>{skill.name}</span>
                <button
                  type="button"
                  onClick={() => handleSkillChange(skill.id, false)}
                  className="text-indigo-600 hover:text-indigo-800">
                  ×
                </button>
              </div>
            ) : null;
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Skills You Want to Learn
        </label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-2"
          onChange={(e) => handleSkillChange(e.target.value, true)}
          value="">
          <option value=""></option>
          {skills
            .filter(
              (skill) => !formData.willingToLearnSkillIds.includes(skill.id)
            )
            .map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
        </select>
        <div className="mt-2 flex flex-wrap gap-2 mb-3">
          {formData.willingToLearnSkillIds.map((skillId) => {
            const skill = skills.find((s) => s.id === skillId);
            return skill ? (
              <div
                key={skill.id}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2">
                <span>{skill.name}</span>
                <button
                  type="button"
                  onClick={() => handleSkillChange(skill.id, true)}
                  className="text-green-600 hover:text-green-800">
                  ×
                </button>
              </div>
            ) : null;
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="jobTitle"
          className="block text-sm font-medium text-gray-700">
          Looking for a Role
        </label>
        <select
          id="jobTitle"
          required
          value={formData.jobTitleId}
          onChange={(e) =>
            setFormData({ ...formData, jobTitleId: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-2">
          <option value=""></option>
          {jobTitles.map((title) => (
            <option key={title.id} value={title.id}>
              {title.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
        {isLoading ? "Registering..." : "Register as Student"}
      </button>
    </form>
  );
}
