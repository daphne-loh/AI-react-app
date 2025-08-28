import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Discover Foods Action */}
        <Link 
          to="/collections"
          className="flex items-center p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg hover:from-primary-100 hover:to-primary-200 transition-all duration-200 group"
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
              <span className="text-white text-lg">🔍</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Discover</p>
            <p className="text-xs text-gray-600">Find new foods</p>
          </div>
        </Link>

        {/* Profile Settings Action */}
        <Link 
          to="/profile"
          className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <span className="text-white text-lg">👤</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Profile</p>
            <p className="text-xs text-gray-600">Manage account</p>
          </div>
        </Link>

        {/* Settings Action */}
        <Link 
          to="/settings"
          className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200 group"
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-colors">
              <span className="text-white text-lg">⚙️</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Settings</p>
            <p className="text-xs text-gray-600">Preferences</p>
          </div>
        </Link>

        {/* Support Action */}
        <a 
          href="mailto:support@fooddrop.com"
          className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors">
              <span className="text-white text-lg">💬</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Support</p>
            <p className="text-xs text-gray-600">Get help</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default QuickActions;