"use client";

import React, { useState } from 'react';
import { DashboardProvider } from '@/context/dashboard-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DashboardTabs } from '@/components/layout/dashboard-tabs';
import { FileUpload } from '@/components/dashboard/file-upload';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { ProcessAnalysis } from '@/components/dashboard/process-analysis';
import { PatternAnalysis } from '@/components/dashboard/pattern-analysis';
import { PredictiveAnalytics } from '@/components/dashboard/predictive-analytics';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'process', label: 'Process Analysis' },
    { id: 'patterns', label: 'Pattern Analysis' },
    { id: 'predictive', label: 'Predictive Analytics' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'process':
        return <ProcessAnalysis />;
      case 'patterns':
        return <PatternAnalysis />;
      case 'predictive':
        return <PredictiveAnalytics />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <DashboardProvider>
      <DashboardLayout>
        <div className="dashboard-container">
          <FileUpload />
          <DashboardTabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          <div className="dashboard-content">
            {renderTabContent()}
          </div>
        </div>
      </DashboardLayout>
    </DashboardProvider>
  );
}
