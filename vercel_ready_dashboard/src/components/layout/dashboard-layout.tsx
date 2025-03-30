"use client";

import React from 'react';

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-logo">
          <h1>Pharmaceutical Process Analytics</h1>
        </div>
        <div className="header-actions">
          {/* Header actions can be added here */}
        </div>
      </header>
      
      <div className="dashboard-main">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <ul>
              <li className="sidebar-nav-item active">
                <span>Dashboard</span>
              </li>
              <li className="sidebar-nav-item">
                <span>Settings</span>
              </li>
              <li className="sidebar-nav-item">
                <span>Help</span>
              </li>
            </ul>
          </nav>
        </aside>
        
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};
