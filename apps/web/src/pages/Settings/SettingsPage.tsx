import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import AccountSettings from './AccountSettings';
import PreferencesForm from './PreferencesForm';
import PasswordChange from './PasswordChange';
import DangerZone from './DangerZone';

type TabType = 'account' | 'preferences' | 'security' | 'danger';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('account');

  const tabs = [
    { id: 'account' as TabType, label: 'Account', icon: '👤' },
    { id: 'preferences' as TabType, label: 'Preferences', icon: '⚙️' },
    { id: 'security' as TabType, label: 'Security', icon: '🔒' },
    { id: 'danger' as TabType, label: 'Account Deletion', icon: '⚠️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings />;
      case 'preferences':
        return <PreferencesForm />;
      case 'security':
        return <PasswordChange />;
      case 'danger':
        return <DangerZone />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tab Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left border-b border-gray-100 last:border-b-0 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 border-l-4 border-l-primary-600 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Mobile Tab Selection */}
            <div className="lg:hidden mt-4">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as TabType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.icon} {tab.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;