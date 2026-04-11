import React from 'react';
import useCrisisStore from '../../store/crisisStore';
import { Users, MapPin, AlertTriangle } from 'lucide-react';
import Badge from '../shared/Badge';

const PeopleTracker = () => {
  const { people, loading, error } = useCrisisStore();

  if (loading) return <div className="text-center text-textSecondary">Loading people data...</div>;
  if (error) return <div className="text-error flex items-center gap-2"><AlertTriangle /> Error loading people data.</div>;

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Users className="text-primary" /> People Tracking
      </h3>
      <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
        {people.length === 0 ? (
          <p className="text-textSecondary">No people currently tracked.</p>
        ) : (
          people.map(person => (
            <div key={person.id} className="flex items-center justify-between bg-background p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-secondary" />
                <span className="text-text font-medium">Person {person.id.substring(0, 6)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-textSecondary" />
                <span className="text-textSecondary text-sm">{person.currentLocationId}</span>
                {person.status === 'evacuating' && <Badge type="warning">Evacuating</Badge>}
                {person.status === 'safe' && <Badge type="success">Safe</Badge>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PeopleTracker;

