import React, { useState, useEffect } from 'react';

const ACHIEVEMENTS = [
  { id: 1, name: 'Task Master', description: 'Complete 10 tasks', requirement: 10 },
  { id: 2, name: 'Productivity Ninja', description: 'Complete 50 tasks', requirement: 50 },
  { id: 3, name: 'Todo Legend', description: 'Complete 100 tasks', requirement: 100 },
];

function Gamification({ items, theme }) {
  const [points, setPoints] = useState(() => {
    const savedPoints = localStorage.getItem('points');
    return savedPoints ? parseInt(savedPoints, 10) : 0;
  });

  const [achievements, setAchievements] = useState(() => {
    const savedAchievements = localStorage.getItem('achievements');
    return savedAchievements ? JSON.parse(savedAchievements) : [];
  });

  useEffect(() => {
    const completedTasks = items.filter(item => item.isCompleted).length;
    const newPoints = completedTasks * 10;
    setPoints(newPoints);

    const newAchievements = ACHIEVEMENTS.filter(
      achievement => completedTasks >= achievement.requirement && !achievements.includes(achievement.id)
    );

    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements.map(a => a.id)]);
    }

    localStorage.setItem('points', newPoints.toString());
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [items, achievements]);

  return (
    <div className={`mt-8 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-2xl font-bold mb-4">Gamification</h2>
      <div className="mb-4">
        <p className="text-xl">
          <span className="font-semibold">Points:</span> {points}
        </p>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Achievements</h3>
        <ul className="space-y-2">
          {ACHIEVEMENTS.map(achievement => (
            <li
              key={achievement.id}
              className={`p-2 rounded ${
                achievements.includes(achievement.id)
                  ? 'bg-green-200 text-green-800'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <span className="font-semibold">{achievement.name}</span>: {achievement.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Gamification;