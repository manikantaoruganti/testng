import React from 'react';

const Badge = ({ children, type = 'info', className = '', ...props }) => {
  const baseStyle = 'px-3 py-1 rounded-full text-xs font-medium';
  let typeStyle = '';

  switch (type) {
    case 'primary':
      typeStyle = 'bg-primary/20 text-primary';
      break;
    case 'secondary':
      typeStyle = 'bg-secondary/20 text-secondary';
      break;
    case 'accent':
      typeStyle = 'bg-accent/20 text-accent';
      break;
    case 'success':
      typeStyle = 'bg-success/20 text-success';
      break;
    case 'warning':
      typeStyle = 'bg-warning/20 text-warning';
      break;
    case 'error':
      typeStyle = 'bg-error/20 text-error';
      break;
    case 'info':
    default:
      typeStyle = 'bg-textSecondary/20 text-textSecondary';
      break;
  }

  return (
    <span className={`${baseStyle} ${typeStyle} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;

