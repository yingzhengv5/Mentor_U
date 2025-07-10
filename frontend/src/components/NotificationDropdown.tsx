import { useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  groupId: string;
  groupName: string;
  timestamp: string;
}

interface NotificationDropdownProps {
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export default function NotificationDropdown({
  onAccept,
  onReject,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: Replace with actual API call
        const mockNotifications: JoinRequest[] = [
          {
            id: "1",
            userId: "user1",
            userName: "John Doe",
            groupId: "group1",
            groupName: "Web Development Group",
            timestamp: new Date().toISOString(),
          },
          // Add more mock notifications as needed
        ];
        setNotifications(mockNotifications);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      await onAccept(requestId);
      // Remove the notification from the list
      setNotifications(notifications.filter((n) => n.id !== requestId));
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await onReject(requestId);
      // Remove the notification from the list
      setNotifications(notifications.filter((n) => n.id !== requestId));
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="relative flex items-center text-sm rounded-full hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <span className="sr-only">Open notifications</span>
        <div className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
        </div>
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
            {notifications.length}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95">
        <Menu.Items className="absolute right-0 mt-2 w-96 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-2 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
          </div>

          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No new notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="px-4 py-3 border-b border-gray-200 last:border-b-0">
                <p className="text-sm text-gray-900 mb-2">
                  <span className="font-medium">{notification.userName}</span>{" "}
                  wants to join{" "}
                  <span className="font-medium">{notification.groupName}</span>
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleReject(notification.id)}
                    className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    Reject
                  </button>
                  <button
                    onClick={() => handleAccept(notification.id)}
                    className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Accept
                  </button>
                </div>
              </div>
            ))
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
