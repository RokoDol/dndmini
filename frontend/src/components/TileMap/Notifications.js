// Notifications.js
import React, { useState, useCallback } from 'react';
import './Notification.css'; // Optional for styling

let showNotificationGlobal;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Function to show a notification
  const showNotification = useCallback((message) => {
    setNotifications((prev) => [...prev, message]);

    // Auto-remove the notification after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 5000);
  }, []);

  // Expose the function globally
  showNotificationGlobal = showNotification;

  return (
    <div className="notifications-container">
      {notifications.map((notification, index) => (
        <div key={index} className="notification">
          {notification}
        </div>
      ))}
    </div>
  );
};

// Function to use globally
export const showNotification = (message) => {
  if (showNotificationGlobal) showNotificationGlobal(message);
};

export default Notifications;