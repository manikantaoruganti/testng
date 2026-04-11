import React from 'react';
import { Loader as LoaderIcon } from 'lucide-react';

const Loader = ({ size = 'md', className = '' }) => {
  let iconSize = 'w-8 h-8';
  if (size === 'sm') iconSize = 'w-6 h-6';
  if (size === 'lg') iconSize = 'w-12 h-12';

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <LoaderIcon className={`${iconSize} text-primary animate-spin`} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;

