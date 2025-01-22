import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../assets/css/Notifications.css';

const Notification = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`notification ${type}`}>
      {type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
      <span>{message}</span>
    </div>
  );
};

export default Notification;