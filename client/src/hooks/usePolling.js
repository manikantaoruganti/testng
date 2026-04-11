import { useEffect, useRef, useCallback } from 'react';

export const usePolling = (callback, delay, dependencies = []) => {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay, ...dependencies]); // Re-run if delay or dependencies change
};

