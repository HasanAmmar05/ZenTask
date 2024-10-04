import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function AnalyticsDashboard({ items, theme }) {
  const completedTasks = items.filter(item => item.isCompleted).length;
  const pendingTasks = items.length - completedTasks;

  const tasksByCategory = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [completedTasks, pendingTasks],
        backgroundColor: ['#4CAF50', '#FFA000'],
        hoverBackgroundColor: ['#45a049', '#ff8f00'],
      },
    ],
  };

  const barData = {
    labels: Object.keys(tasksByCategory),
    datasets: [
      {
        label: 'Tasks per Category',
        data: Object.values(tasksByCategory),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tasks by Category',
      },
    },
  };

  return (
    <div className={`mt-8 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-2xl font-bold mb-6">Task Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Task Completion Status</h3>
          <Pie data={pieData} />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Tasks by Category</h3>
          <Bar options={options} data={barData} />
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;