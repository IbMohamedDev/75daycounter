
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

const DayCounter = () => {
  // Get today's date as a string in YYYY-MM-DD format for initial state
  const getTodayString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  // Initialize start date from localStorage or default to today
  const [startDateString, setStartDateString] = useState(() => {
    const saved = localStorage.getItem('startDate');
    return saved || getTodayString();
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [endDateString, setEndDateString] = useState('');
  
  // Calculate days between two date strings (YYYY-MM-DD format)
  const daysBetween = (date1String, date2String) => {
    const date1 = new Date(date1String + 'T00:00:00');
    const date2 = new Date(date2String + 'T00:00:00');
    
    // Get time difference in milliseconds
    const diffTime = date2.getTime() - date1.getTime();
    
    // Convert to days and round to handle DST changes
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Calculate end date and current day whenever start date changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('startDate', startDateString);
    
    // Calculate end date (start date + 74 days)
    const startDate = new Date(startDateString + 'T00:00:00');
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 74); // 75 days total (day 1 is the start date)
    
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    setEndDateString(endDateStr);
    
    // Calculate current day
    const todayString = getTodayString();
    
    // If today is before start date, show day 1
    if (daysBetween(todayString, startDateString) > 0) {
      setCurrentDay(1);
    } else {
      // Calculate days since start (including start day as day 1)
      const daysSinceStart = daysBetween(startDateString, todayString) + 1;
      setCurrentDay(Math.min(75, Math.max(1, daysSinceStart)));
    }
  }, [startDateString]);
  
  // Check for day changes periodically
  useEffect(() => {
    const checkDayChange = () => {
      const newTodayString = getTodayString();
      
      // If today is before start date, show day 1
      if (daysBetween(newTodayString, startDateString) > 0) {
        setCurrentDay(1);
      } else {
        // Calculate days since start (including start day as day 1)
        const daysSinceStart = daysBetween(startDateString, newTodayString) + 1;
        setCurrentDay(Math.min(75, Math.max(1, daysSinceStart)));
      }
    };
    
    // Check every hour for date changes
    const intervalId = setInterval(checkDayChange, 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [startDateString]);
  
  // Format date for display (Month Day - Weekday, Month Day, Year)
  const formatDateRange = () => {
    const startDate = new Date(startDateString + 'T00:00:00');
    const endDate = new Date(endDateString + 'T00:00:00');
    
    const startFormatted = startDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric'
    });
    
    const endFormatted = endDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };
  
  // Handle date change from settings
  const handleDateChange = (e) => {
    setStartDateString(e.target.value);
    setShowSettings(false);
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-center p-6 relative">
      {/* Settings gear icon */}
      <button 
        className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
        onClick={() => setShowSettings(!showSettings)}
      >
        <Settings size={24} />
      </button>
      
      {/* Settings panel */}
      {showSettings && (
        <div className="absolute top-12 right-4 bg-white shadow-lg rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-medium mb-2">Set Start Date</h3>
          <input 
            type="date" 
            className="border rounded p-2 mb-2 w-full"
            value={startDateString}
            onChange={handleDateChange}
          />
        </div>
      )}
      
      {/* Counter display */}
      <div className="bg-gray-300 rounded-full px-8 py-3 inline-flex justify-center mb-6">
        <span className="text-2xl font-bold text-red-600">{currentDay} / 75</span>
      </div>
      
      {/* Date range display */}
      <div className="text-gray-700">
        {endDateString && formatDateRange()}
      </div>
    </div>
  );
};

export default DayCounter;