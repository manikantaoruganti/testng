import React from 'react';
import { Clock, FastForward, Rewind } from 'lucide-react';

const Timeline = ({ currentTime, totalDuration, events }) => {
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s]
      .map(v => v < 10 ? '0' + v : v)
      .filter((v, i) => v !== '00' || i > 0)
      .join(':');
  };

  return (
    <div className="simulation-timeline p-4">
      <div className="flex items-center justify-between mb-4">
        <Clock className="w-6 h-6 text-primary" />
        <span className="text-text font-medium">Simulation Progress</span>
        <div className="text-textSecondary text-sm">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </div>
      </div>
      <div className="relative h-2 bg-background rounded-full mb-4">
        <div
          className="absolute h-full bg-primary rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
        {events.map((event, index) => (
          <div
            key={index}
            className="absolute w-2 h-2 bg-accent rounded-full -translate-x-1/2 -translate-y-1/2 top-1/2"
            style={{ left: `${(event.time / totalDuration) * 100}%` }}
            title={event.description}
          ></div>
        ))}
      </div>
      <div className="flex justify-between text-textSecondary text-xs">
        <span>Start</span>
        <span>End</span>
      </div>
    </div>
  );
};

export default Timeline;

