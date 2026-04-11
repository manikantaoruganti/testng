import React, { useEffect, useState } from 'react';
import { X, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import Button from './Button';

const Notification = ({ id, message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  if (!isVisible) return null;

  let icon;
  let bgColor;
  let textColor;
  let borderColor;

  switch (type) {
    case 'success':
      icon = <CheckCircle className="w-5 h-5" />;
      bgColor = 'bg-success/10';
      textColor = 'text-success';
      borderColor = 'border-success';
      break;
    case 'warning':
      icon = <AlertTriangle className="w-5 h-5" />;
      bgColor = 'bg-warning/10';
      textColor = 'text-warning';
      borderColor = 'border-warning';
      break;
    case 'error':
      icon = <XCircle className="w-5 h-5" />;
      bgColor = 'bg-error/10';
      textColor = 'text-error';
      borderColor = 'border-error';
      break;
    case 'info':
    default:
      icon = <Info className="w-5 h-5" />;
      bgColor = 'bg-secondary/10';
      textColor = 'text-secondary';
      borderColor = 'border-secondary';
      break;
  }

  return (
    <div className={`flex items-center p-4 rounded-xl shadow-lg border ${bgColor} ${borderColor} animate-slide-in-up`}>
      <div className={`flex-shrink-0 ${textColor}`}>
        {icon}
      </div>
      <div className="ml-3 flex-1">
        <p className={`text-sm font-medium ${textColor}`}>{message}</p>
      </div>
      <Button onClick={() => { setIsVisible(false); if (onClose) onClose(id); }} className="ml-auto p-1 rounded-full hover:bg-background">
        <X className={`w-4 h-4 ${textColor}`} />
      </Button>
    </div>
  );
};

export default Notification;

