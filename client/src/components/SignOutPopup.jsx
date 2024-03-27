import React from 'react';

const SignOutPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white rounded-lg p-6 z-10">
        <h2 className="text-xl font-semibold mb-4">Sign Out Successful</h2>
        <p className="text-gray-600 mb-6">You have been successfully signed out.</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SignOutPopup;