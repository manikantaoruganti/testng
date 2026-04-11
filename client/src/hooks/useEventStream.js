import { useEffect, useState } from 'react';
import useSocket from './useSocket';

export const useEventStream = (eventName) => {
  const { socket, isConnected } = useSocket();
  const [events, setEvents] = useState([]);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    if (socket && isConnected && eventName) {
      const handler = (data) => {
        setEvents((prevEvents) => [...prevEvents, data]);
        setLastEvent(data);
      };
      socket.on(eventName, handler);
      return () => {
        socket.off(eventName, handler);
      };
    }
  }, [socket, isConnected, eventName]);

  return { events, lastEvent, isConnected };
};

