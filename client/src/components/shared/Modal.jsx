import React, { useEffect, useRef } from 'react';
import X from 'lucide-react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling background
    } else {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div
        ref={modalRef}
        className={`bg-surface rounded-xl shadow-lg-glow p-8 w-full max-w-lg mx-4 border border-border animate-slide-in-up ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 id="modal-title" className="text-2xl font-bold text-text">{title}</h3>
          <Button onClick={onClose} className="p-2 rounded-lg hover:bg-background">
            <X className="w-6 h-6 text-textSecondary hover:text-primary" />
          </Button>
        </div>
        <div className="text-textSecondary">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

