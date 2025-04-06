import { useState, useEffect } from 'react';

export function useSystemDate() {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const storedDate = localStorage.getItem('currentSystemDate');
    return storedDate ? new Date(storedDate) : new Date();
  });

  useEffect(() => {
    // Update local state when localStorage changes
    const interval = setInterval(() => {
      const storedDate = localStorage.getItem('currentSystemDate');
      if (storedDate) {
        setCurrentDate(new Date(storedDate));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return currentDate;
}