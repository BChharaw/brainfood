// src/components/PhoneContainer.jsx
import React from 'react';

const PhoneContainer = ({ children }) => {
  return (
    <div className="relative bg-black rounded-3xl shadow-2xl overflow-hidden mx-auto my-8 border border-gray-700" style={{ width: '375px', height: '812px' }}>
      {children}
    </div>
  );
};

export default PhoneContainer;