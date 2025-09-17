
import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  duration: number;
  show: boolean;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, duration, show, onHide }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Allow time for fade-out animation before calling onHide
        setTimeout(onHide, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onHide]);

  return (
    <div
      className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg text-yellow-900 bg-yellow-400/80 backdrop-blur-sm border border-yellow-500 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
      }`}
      role="alert"
      aria-live="assertive"
    >
      {message}
    </div>
  );
};

export default Toast;