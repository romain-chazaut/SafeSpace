import React, { useEffect } from 'react';
import { useNotification } from '../NotificationsContext';
import Notification from '../composants/Notification';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const NotificationManager = () => {
  const { notifications, addNotification, removeNotification } = useNotification();

  useEffect(() => {
    socket.on('cronJobCompleted', (data) => {
      addNotification(data.message, 'success');
    });

    socket.on('cronJobError', (data) => {
      addNotification(data.message, 'error');
    });

    socket.on('cronJobAdded', (data) => {
      addNotification(data.message, 'success');
    });

    socket.on('cronJobRemoved', (data) => {
      addNotification(data.message, 'success');
    });

    return () => {
      socket.off('cronJobCompleted');
      socket.off('cronJobError');
      socket.off('cronJobAdded');
      socket.off('cronJobRemoved');
    };
  }, [addNotification]);

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationManager;