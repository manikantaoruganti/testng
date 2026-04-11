import React from 'react';

const Tooltip = ({ visible, x, y, content, className = '' }) => {
  if (!visible) return null;

  return (
    <div
      className={`fixed bg-surface text-text text-sm px-3 py-2 rounded-lg shadow-lg border border-border pointer-events-none z-50 animate-fade-in ${className}`}
      style={{ left: x, top: y }}
    >
      {content}
    </div>
  );
};

export default Tooltip;

