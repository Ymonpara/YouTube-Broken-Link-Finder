import React from 'react';
import DashboardPage from './components/DashboardPage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardPage session={null} />
    </div>
  );
};

export default App;
