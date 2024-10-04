import React, { useState, useEffect } from 'react';

function PomodoroTimer({ onTimerComplete }) {
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      clearInterval(interval);
      setIsActive(false);
      onTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, time, onTimerComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setTime(25 * 60);
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-2">
      <div className="text-2xl font-bold mb-2">{formatTime(time)}</div>
      <div className="space-x-2">
        <button
          onClick={toggleTimer}
          className={`px-3 py-1 rounded-md ${
            isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white transition duration-300`}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="px-3 py-1 rounded-md bg-gray-500 hover:bg-gray-600 text-white transition duration-300"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default PomodoroTimer;