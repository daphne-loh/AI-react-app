import React from 'react';

const SubscriptionCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 mb-4">
          <span className="text-white text-lg">✨</span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Access</h3>
        <p className="text-sm text-gray-600 mb-4">
          Unlock weekly food discoveries and exclusive collections
        </p>

        {/* Subscription Status - Placeholder */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-full">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Free Plan
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ready to upgrade when you are!
          </p>
        </div>

        {/* Features List */}
        <div className="text-left mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Premium Features:</h4>
          <ul className="space-y-2">
            <li className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Weekly food discoveries
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Exclusive collections
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Priority support
            </li>
          </ul>
        </div>

        <button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200">
          Learn More
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCard;