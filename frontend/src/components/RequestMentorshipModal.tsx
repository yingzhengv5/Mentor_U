"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { UserDto } from "@/interfaces/auth";
import { MentorshipDuration } from "@/interfaces/mentorship";

interface RequestMentorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string, duration: MentorshipDuration) => Promise<void>;
  mentor: UserDto | null;
}

export function RequestMentorshipModal({
  isOpen,
  onClose,
  onSubmit,
  mentor,
}: RequestMentorshipModalProps) {
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState<MentorshipDuration>(
    MentorshipDuration.ThreeMonths
  );

  const handleSubmit = async () => {
    try {
      await onSubmit(message, duration);
      setMessage(""); // Clear message after successful submission
      onClose();
    } catch (error) {
      console.error("Error submitting mentorship request:", error);
      alert("Failed to send mentorship request. Please try again.");
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900">
                  Request Mentorship from {mentor?.firstName} {mentor?.lastName}
                </Dialog.Title>

                {mentor && (
                  <div className="mt-4">
                    {/* Duration Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <select
                        value={duration}
                        onChange={(e) =>
                          setDuration(
                            Number(e.target.value) as MentorshipDuration
                          )
                        }
                        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value={MentorshipDuration.OneMonth}>
                          1 Month
                        </option>
                        <option value={MentorshipDuration.TwoMonths}>
                          2 Months
                        </option>
                        <option value={MentorshipDuration.ThreeMonths}>
                          3 Months
                        </option>
                      </select>
                    </div>

                    <div className="text-sm text-gray-500 mb-4">
                      Send a message to introduce yourself and explain what
                      you&apos;d like to learn.
                    </div>
                    <textarea
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write a message to your potential mentor..."
                    />
                  </div>
                )}

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={handleSubmit}>
                    Send Request
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
