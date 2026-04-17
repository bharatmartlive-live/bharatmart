import { useEffect, useState } from 'react';
import { getIndiaHour, randomBetween } from '../lib/time';

function getRange(type) {
  if (type === 'home') return [900, 1200];

  const hour = getIndiaHour();
  if (hour >= 0 && hour < 6) return [80, 90];
  if (hour >= 6 && hour < 10) return [280, 460];
  if (hour >= 10 && hour < 22) return [600, 800];
  return [120, 180];
}

export function useLiveViewers(type = 'product') {
  const [count, setCount] = useState(() => {
    const [min, max] = getRange(type);
    return randomBetween(min, max);
  });

  useEffect(() => {
    const update = () => {
      const [min, max] = getRange(type);
      setCount(randomBetween(min, max));
    };

    const interval = window.setInterval(update, 15000);
    return () => window.clearInterval(interval);
  }, [type]);

  return count;
}
