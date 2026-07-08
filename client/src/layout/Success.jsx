import React from 'react';

const Success = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <svg
          className="w-16 h-16 text-green-500 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h2 className="text-2xl font-semibold text-center mb-4">Payment Successful</h2>
        <p className="text-gray-700 text-center">Thank you for your payment.</p>
      </div>
    </div>
  );
};

export default Success;
