import React from 'react';

const Button = ({ children, onClick, className = 'btn-primary', type = 'button', disabled = false, ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} transition-all duration-200 ease-in-out`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

