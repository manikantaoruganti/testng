import React from 'react';
import { Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react';
import Badge from '../shared/Badge';

const LiveStatusBar = ({ isConnected }) => {
  return (
    <div className="flex items-center gap-3 animate-fade-in">
      {isConnected ? (
        <>
          <Wifi className="w-5 h-5 text-success animate-pulse-glow" />
          <Badge type="success">Live Connected</Badge>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5 text-error" />
          <Badge type="error">Disconnected</Badge>
        </>
      )}
    </div>
  );
};

export default LiveStatusBar;

