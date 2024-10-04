import React from 'react';

function ThemeToggle({ theme, setTheme }) {
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="mt-4 text-center">
      <button
        onClick={toggleTheme}
        className={`px-4 py-2 rounded-md ${
          theme === 'dark'
            ? 'bg-yellow-400 text-gray-900'
            : 'bg-gray-800 text-white'
        } transition duration-300`}
      >
        {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
    </div>
  );
}

export default ThemeToggle;