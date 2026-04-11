import React, { useState } from 'react';
import { Zap, Send, AlertTriangle } from 'lucide-react';
import Button from '../shared/Button';
import Input from '../shared/Input'; // Assuming an Input component

const EventTrigger = ({ onTrigger }) => {
  const [eventType, setEventType] = useState('fire_detected');
  const [locationId, setLocationId] = useState('');
  const [intensity, setIntensity] = useState(5); // For fire events

  const handleTrigger = () => {
    if (!locationId) {
      alert('Please enter a location ID.');
      return;
    }
    onTrigger({
      type: eventType,
      payload: {
        locationId,
        intensity: eventType === 'fire_detected' ? intensity : undefined,
        timestamp: Date.now(),
      },
    });
    setLocationId('');
    setIntensity(5);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="eventType" className="block text-textSecondary text-sm font-medium mb-2">Event Type</label>
        <select
          id="eventType"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="input-field"
        >
          <option value="fire_detected">Fire Detected</option>
          <option value="panic_triggered">Panic Triggered</option>
          <option value="sensor_malfunction">Sensor Malfunction</option>
          <option value="evacuation_started">Evacuation Started</option>
        </select>
      </div>
      <div>
        <label htmlFor="locationId" className="block text-textSecondary text-sm font-medium mb-2">Location ID</label>
        <Input
          id="locationId"
          type="text"
          placeholder="e.g., room-101"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
        />
      </div>
      {eventType === 'fire_detected' && (
        <div>
          <label htmlFor="intensity" className="block text-textSecondary text-sm font-medium mb-2">Fire Intensity (1-10)</label>
          <input
            type="range"
            id="intensity"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="block text-center text-textSecondary text-sm mt-1">{intensity}</span>
        </div>
      )}
      <Button onClick={handleTrigger} className="btn-primary w-full flex items-center justify-center gap-2">
        <Send className="w-5 h-5" /> Trigger Event
      </Button>
    </div>
  );
};

export default EventTrigger;

