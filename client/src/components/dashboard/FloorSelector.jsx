import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const FloorSelector = ({ floors, currentFloor, onSelectFloor }) => {
  if (!floors || floors.length <= 1) return null;

  const currentIndex = floors.findIndex(f => f.id === currentFloor);
  const canGoUp = currentIndex > 0;
  const canGoDown = currentIndex < floors.length - 1;

  const handleUp = () => {
    if (canGoUp) {
      onSelectFloor(floors[currentIndex - 1].id);
    }
  };

  const handleDown = () => {
    if (canGoDown) {
      onSelectFloor(floors[currentIndex + 1].id);
    }
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col items-center bg-surface/90 backdrop-blur-sm p-2 rounded-xl border border-border shadow-lg z-10 animate-fade-in">
      <button
        onClick={handleUp}
        disabled={!canGoUp}
        className={`p-2 rounded-lg transition-colors duration-200 ${canGoUp ? 'hover:bg-primary/20 text-primary' : 'text-textSecondary opacity-50 cursor-not-allowed'}`}
        aria-label="Go up a floor"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
      <span className="text-text font-semibold my-1">
        {floors[currentIndex]?.name || 'N/A'}
      </span>
      <button
        onClick={handleDown}
        disabled={!canGoDown}
        className={`p-2 rounded-lg transition-colors duration-200 ${canGoDown ? 'hover:bg-primary/20 text-primary' : 'text-textSecondary opacity-50 cursor-not-allowed'}`}
        aria-label="Go down a floor"
      >
        <ChevronDown className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FloorSelector;

