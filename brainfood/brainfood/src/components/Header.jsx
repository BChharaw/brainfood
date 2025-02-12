// src/components/Header.jsx
import React from 'react';

const Header = ({ darkMode, setDarkMode, openSettings }) => {
  return (
    <header className="absolute top-0 left-0 w-full flex justify-between items-center p-4 z-50">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="bg-gray-800 hover:bg-gray-700 p-2 rounded text-sm"
      >
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <button
        onClick={openSettings}
        className="bg-gray-800 hover:bg-gray-700 p-2 rounded text-sm"
      >
        Settings
      </button>
    </header>
  );
};

export default Header;